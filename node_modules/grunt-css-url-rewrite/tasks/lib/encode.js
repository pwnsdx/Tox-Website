/*
 * Grunt CSS Url Rewrite
 * https://github.com/jpunt/grunt-css-url-rewrite
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

// Node libs
var fs = require("fs");
var path = require("path");
var mime = require("mime");

// Internal Libs
var grunt_fetch = require("./fetch");

// Cache regex's
var rImages = /([\s\S]*?)(url\(([^)]+)\))(?!\s*[;,]?\s*\/\*\s*CssUrlRewrite:skip\s*\*\/)|([\s\S]+)/img; // TODO: Strip of CssUrlRewrite:skip
var rExternal = /^http/;
var rData = /^data:/;
var rQuotes = /['"]/g;
var rParams = /([?#].*)$/g;

// Grunt export wrapper
exports.init = function(grunt) {
  "use strict";

  var exports = {};

  // Grunt lib init
  var fetch = grunt_fetch.init(grunt);

  // Grunt utils
  var utils = grunt.utils || grunt.util;
  var file = grunt.file;
  var _ = utils._;
  var async = utils.async;

  /**
   * Takes a CSS file as input, goes through it line by line, and base64
   * encodes any images it finds.
   *
   * @param srcFile Relative or absolute path to a source stylesheet file.
   * @param opts Options object
   * @param done Function to call once encoding has finished.
   */
  exports.stylesheet = function(srcFile, opts, done) {
    opts = opts || {};

    // Shift args if no options object is specified
    if(utils.kindOf(opts) === "function") {
      done = opts;
      opts = {};
    }

    var src = file.read(srcFile);
    var result = "";
    var match, img, line, tasks, group, params;

    async.whilst(function() {
      group = rImages.exec(src);
      return group != null;
    },
    function(complete) {
      // if there is another url to be processed, then:
      //    group[1] will hold everything up to the url declaration
      //    group[2] will hold the complete url declaration (useful if no encoding will take place)
      //    group[3] will hold the contents of the url declaration
      //    group[4] will be undefined
      // if there is no other url to be processed, then group[1-3] will be undefined
      //    group[4] will hold the entire string

      if(group[4] == null) {
        result += group[1];

        params = group[3]
          .replace(rQuotes, "")
          .match(rParams);

        img = group[3].trim()
          .replace(rQuotes, "")
          .replace(rParams, ""); // remove query string/hash parmams in the filename, like foo.png?bar or foo.png#bar

        // Ignore and strip off by querystring
        if(_.indexOf(params, "?gruntCssUrlRewrite=skip") > -1) {
          result += 'url("' + img + '")';
          complete();
          return;
        }

        // Skip external
        if(opts.skipExternal && rExternal.test(img)) {
          result += 'url("' + img + '")';
          complete();
          return;
        }

        // process it
        var loc = img,
          is_local_file = !rData.test(img) && !rExternal.test(img);

        // Resolve the image path relative to the CSS file
        if(is_local_file) {
          // local file system.. fix up the path
          loc = img.charAt(0) === "/" ?
            (opts.baseDir || "") + loc :
            path.join(path.dirname(srcFile),  (opts.baseDir || "") + img).replace(/\\/g, '/');

          // If that didn't work, try finding the image relative to
          // the current file instead.
          if(!fs.existsSync(loc)) {
            loc = path.resolve(__dirname + img);
          }
        }

        exports.image(loc, opts, function(err, resp) {
          if (err == null) {
            if(!opts.stripParameters && params && params.length > 0) {
              loc = loc + params.join('');
            }

            if(opts.rewriteUrl) {
              resp = opts.rewriteUrl(loc, opts, resp);
            }

            var url = 'url("' + resp + '")';
            result += url;
          } else {
            result += group[2];
          }

          complete();
        });
      } else {
        result += group[4];
        complete();
      }
    },
    function() {
      done(null, result);
    });
  };


  /**
   * Takes an image (absolute path or remote) and base64 encodes it.
   *
   * @param img Absolute, resolved path to an image
   * @param opts Options object
   * @return A data URI string (mime type, base64 img, etc.) that a browser can interpret as an image
   */
  exports.image = function(img, opts, done) {

    // Shift args
    if(utils.kindOf(opts) === "function") {
      done = opts;
      opts = {};
    }

    var complete = function(err, encoded) {
      // Return the original source if an error occurred
      if(err) {
        grunt.log.error(err);
        done(err, img, false);

        // Otherwise return the processed image
      } else {
        done(null, encoded);
      }
    };

    // Already base64 encoded?
    if(rData.test(img)) {
      complete(null, img, false);
    } else
    // External URL?
    if(rExternal.test(img)) {
      grunt.log.writeln("Encoding file: " + img);
      fetch.image(img, function(err, src) {
        var encoded, type;
        if (err == null) {
          type = mime.lookup(img);
          encoded = exports.getDataURI(type, src);
        }
        complete(err, encoded);
      });

      // Local file?
    } else {
      // Does the image actually exist?
      if(!fs.existsSync(img)) {
        grunt.fail.warn("File " + img + " does not exist");
        complete(null, img, false);
        return;
      }

      grunt.log.writeln("Encoding file: " + img);

      // Read the file in and convert it.
      var src = fs.readFileSync(img);
      var type = mime.lookup(img);
      var encoded = exports.getDataURI(type, src);
      complete(null, encoded, true);
    }
  };


  /**
   * Base64 encodes an image and builds the data URI string
   *
   * @param mimeType Mime type of the image
   * @param img The source image
   * @return Data URI string
   */
  exports.getDataURI = function(mimeType, img) {
    var ret = "data:";
    ret += mimeType;
    ret += ";base64,";
    ret += img.toString("base64");
    return ret;
  };

  return exports;
};
