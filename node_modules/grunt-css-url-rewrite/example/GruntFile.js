/*global module:false*/
module.exports = function(grunt) {
  "use strict";

  grunt.loadTasks("../tasks");

  grunt.initConfig({
    cssUrlRewrite: {
      dist: {
        src: "css/styles.css",
        dest: "css/output.css",
        options: {
          skipExternal: true,
          rewriteUrl: function(url, options, dataURI) {
            var path = url.replace(options.baseDir, '');
            var hash = require('crypto').createHash('md5').update(dataURI).digest('hex');
            return '/v-' + hash + '/' + path;
          }
        }
      }
    }
  });

  grunt.registerTask("default", ["cssUrlRewrite"]);
};
