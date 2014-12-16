/*
*   _____  ___ __  __
*  |_   _|/ _ \\ \/ /
*    | | | (_) |>  <   -> Grunt Configuration File
*    |_|  \___//_/\_\
*
*/

var $development = 'src/'; // Development Folder
var $production  = 'dist/'; // Production Folder (this is where the webserver will server requests)
var $buildName   = 'build'; // Prefix of the generated files (do not touch)

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            removeOldDist: $production,
            cleanupNewDist: [
                $production + 'assets/vendor/',
                $production + 'assets/js/',
                '!' + $production + 'assets/js/' + $buildName + '.js',
                $production + 'assets/css/',
                '!' + $production + 'assets/css/' + $buildName + '.css'
            ]
        },
        copy: {
            src: {
                expand: true,
                cwd: $development,
                src: ['**'],
                dest: $production
            },
        },
        useminPrepare: {
            html: $development + 'index.html',
        },
        cssmin: {
            options: {
                report: 'gzip'
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                report: 'gzip',
                drop_console: true
            }
        },
        filerev: {
            options: {
                algorithm: 'sha1',
                length: 40
            },
            dist: {
                src: [
                    $production + 'assets/js/' + $buildName + '.js',
                    $production + 'assets/css/' + $buildName + '.css'
                ]
            }
        },
        usemin: {
            html: $production + 'index.html'
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask('build', [
        'clean:removeOldDist',
        'copy:src',
        'clean:cleanupNewDist',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
    grunt.registerTask('default', ['build']);
};