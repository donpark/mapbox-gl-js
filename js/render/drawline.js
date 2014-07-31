'use strict';

var browser = require('../util/browser.js');

module.exports = function drawLine(gl, painter, bucket, layerStyle, posMatrix, params) {

    posMatrix = painter.translateMatrix(posMatrix, params.z, layerStyle['line-translate'], layerStyle['line-translate-anchor']);

    // don't draw zero-width lines
    if (layerStyle['line-width'] <= 0) return;

    var lineOffset = layerStyle['line-offset'] / 2;
    var inset = Math.max(-1, lineOffset - layerStyle['line-width'] / 2 - 0.5) + 1;
    var outset = lineOffset + layerStyle['line-width'] / 2 + 0.5;

    var shader;

    var tilePixelRatio = painter.transform.scale / (1 << params.z) / 8;

    var dasharray = layerStyle['line-dasharray'];
    var image = layerStyle['line-image'];

    var pattern = dasharray || image;
    if (pattern) {

        if (image) return;

        var lineAtlas = dasharray ? painter.sdfLineAtlas : painter.lineAtlas;
        var posA = lineAtlas.getPosition(pattern.from.value);
        var posB = lineAtlas.getPosition(pattern.to.value);

        var scaleA = [tilePixelRatio / posA.width / pattern.from.scale, -posA.height / 2];
        var scaleB = [tilePixelRatio / posB.width / pattern.to.scale, -posB.height / 2];

        lineAtlas.bind(gl);

        shader = painter.linesdfShader;
        gl.switchShader(shader, posMatrix, painter.tile.exMatrix);
        gl.uniform2fv(shader.u_patternscale_a, scaleA);
        gl.uniform2fv(shader.u_patternscale_b, scaleB);
        gl.uniform1f(shader.u_tex_y_a, posA.y);
        gl.uniform1f(shader.u_tex_y_b, posB.y);
        gl.uniform1f(shader.u_fade, pattern.t);
        gl.uniform4fv(shader.u_color, layerStyle['line-color']);

    } else {
        shader = painter.lineShader;
        gl.switchShader(shader, posMatrix, painter.tile.exMatrix);
        gl.uniform2fv(shader.u_dasharray, layerStyle['line-dasharray'] || [1, -1]);
        gl.uniform4fv(shader.u_color, layerStyle['line-color']);
        gl.uniform1f(shader.u_blur, layerStyle['line-blur']);
    }

    gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
    gl.uniform1f(shader.u_ratio, tilePixelRatio);
    gl.uniform1f(shader.u_gamma, browser.devicePixelRatio);


    var vertex = bucket.buffers.lineVertex;
    vertex.bind(gl);
    var element = bucket.buffers.lineElement;
    element.bind(gl);

    var groups = bucket.elementGroups.groups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var offset = group.vertexStartIndex * vertex.itemSize;
        gl.vertexAttribPointer(shader.a_pos, 4, gl.SHORT, false, 8, offset + 0);
        gl.vertexAttribPointer(shader.a_extrude, 2, gl.BYTE, false, 8, offset + 6);
        gl.vertexAttribPointer(shader.a_linesofar, 2, gl.SHORT, false, 8, offset + 4);

        var count = group.elementLength * 3;
        var elementOffset = group.elementStartIndex * element.itemSize;
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, elementOffset);
    }

};
