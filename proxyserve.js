#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path')
  , exec = require('child_process').exec
  , connect = require('connect')
  , url = require('url')
  , fs = require('fs')
  , request = require('request')
  , mkdirp = require('mkdirp');

var root = path.resolve('.');
var port = 3000;
var hidden = false;
var icons = false;

// setup the server
var server = connect();

// logger
server.use(connect.logger('dev'));

// CORS access for files
server.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, x-csrf-token, origin');
  if ('OPTIONS' == req.method) return res.end();
  next();
});

// compression
// server.use(connect.compress());

// create cache directory
var cachePathPrefix = "/temp/cache";
mkdirp.sync(path.join(root, cachePathPrefix), {});

// retrieve if missing
server.use(function (req, res, next) {
  if (req.url.indexOf(cachePathPrefix) !== 0) {
    next();
  } else {
    var resurl = url.parse(req.url);
    var respath = path.join(root, unescape(resurl.pathname));
    fs.exists(respath, function (exists) {
      if (exists) {
        next();
      } else {
        resurl.protocol = "http";
        resurl.host = "a.tiles.mapbox.com";
        resurl.pathname = resurl.pathname.substring(cachePathPrefix.length);
        srcurl = url.format(resurl);
        console.log("retrieving missing resource from", srcurl);
        request({
          url: srcurl,
          encoding: null,
          gzip: true
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            console.log("retrieved", srcurl);
            mkdirp(path.dirname(respath), {}, function (err, made) {
              if (!err) {
                fs.writeFile(respath, body, { encoding: 'binary' }, function (err) {
                  console.log("saved, proceeding to serve");
                  next();
                });
              } else {
                next();
              }
            });
          } else {
            next();
          }
        });
      }
    });
  }
});

// static files
server.use(connect.static(root, { hidden: hidden }));

// directory serving

server.use(connect.directory(root, {
    hidden: hidden
  , icons: icons
}));

// start the server
server.listen(port, function () {
  console.log('\033[90mserving \033[36m%s\033[90m on port \033[96m%d\033[0m', root, port);
});

