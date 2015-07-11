/*
*   _____  ___ __  __
*  |_   _|/ _ \\ \/ /
*    | | | (_) |>  <   -> Grunt Configuration File
*    |_|  \___//_/\_\
*
*/

var mozjpeg             = require('imagemin-mozjpeg');
var $development        = 'src/'; // Development Folder
var $production         = 'dist/'; // Production Folder (this is where the webserver will serve requests)
var $buildName          = 'build'; // Prefix of the generated files (don't touch)
var $buildNameImages    = 'build-images'; // Prefix of the generated files for images@1x (don't touch)

// Centralize all options here
var $options = {
    imageEmbed: {
        maxImageSize: 0, // meh IE8 and below
        deleteAfterEncoding: true
    },
    imagemin: {
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }],
        use: [mozjpeg()]
    },
    uglify: {
        preserveComments: false,
        drop_console: true, // Remove console warning
        report: 'gzip'
    },
    filerev: {
        algorithm: 'sha1',
        length: 40
    },
    cssmin: {
        report: 'gzip'
    }
};

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-filerev'); // https://github.com/yeoman/grunt-filerev
    grunt.loadNpmTasks('grunt-usemin'); // https://github.com/yeoman/grunt-usemin
    grunt.loadNpmTasks('grunt-image-embed'); // https://github.com/ehynds/grunt-image-embed
    grunt.loadNpmTasks('grunt-text-replace'); // https://github.com/yoniholmes/grunt-text-replace
    grunt.loadNpmTasks('grunt-autoprefixer'); // https://github.com/nDmitry/grunt-autoprefixer

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            tempDir: '.tmp',
            oldDist: $production,
            newDist: [
                // General specs
                $production + 'hidden.html', // Remove hidden.html file
                $production + 'assets/vendor/', // Do not take vendor directory

                // JS specs
                $production + 'assets/js/*',
                '!' + $production + 'assets/js/' + $buildName + '.*.js',

                // CSS specs
                $production + 'assets/css/*',
                '!' + $production + 'assets/css/' + $buildName + '.*.css',
                '!' + $production + 'assets/css/' + $buildNameImages + '.*.css',
                '!' + $production + 'assets/css/' + $buildNameImages + '@2x.*.css'
            ],
        },
        copy: {
            developmentToProduction: {
                expand: true,
                cwd: $development,
                src: ['**'],
                dest: $production
            }
        },
        imageEmbed: {
            developmentToProduction: {
                src: [ $production + 'assets/css/tox-homepage.css' ],
                dest: $production + 'assets/css/tox-homepage.css',
                options: $options.imageEmbed
            },
            images: {
                src: [ $production + 'assets/css/tox-images.css' ],
                dest: $production + 'assets/css/tox-images.css',
                options: $options.imageEmbed
            },
            imagesRetina: {
                src: [ $production + 'assets/css/tox-images@2x.css' ],
                dest: $production + 'assets/css/tox-images@2x.css',
                options: $options.imageEmbed
            }
        },
        imagemin: {
            dynamic: {
                options: $options.imagemin,
                files: [{
                    expand: true,
                    cwd: $production + 'assets/images',
                    src: ['**/*.{png,jpg,jpeg,gif}'],
                    dest: $production + 'assets/images'
                }]
            }
        },
        autoprefixer: {
            homepage: {
                options: {
                    // Default browser list is: > 1%, last 2 versions, Firefox ESR, Opera 12.1.
                    // https://github.com/ai/browserslist
                    //diff: $production + 'css.diff', // Debug
                    browsers: ['> 1%', 'last 5 versions', 'Firefox ESR', 'Opera 12.1', 'IE 9'],
                    cascade: false, // Don't do cascade indentation
                    remove: false // Disable outdated prefixes
                },
                src: $production + 'assets/css/tox-homepage.css',
                dest: $production + 'assets/css/tox-homepage.css'
            },
        },
        useminPrepare: {
            html: [
                $production + 'index.html',
                $production + 'hidden.html'
            ]
        },
        cssmin: {
            options: $options.cssmin
        },
        uglify: {
            options: $options.uglify
        },
        replace: {
            cssPaths: {
                src: [ $production + 'index.html'],    // Source files array (supports minimatch)
                //dest: $production + 'index.html',
                overwrite: true, // Overwrite matched source files
                replacements: [{
                    from: 'assets/css/tox-images.css',
                    to: function (matchedWord) {   // callback replacement
                        var finalTo = grunt.filerev.summary[$production + 'assets/css/' + $buildNameImages + '.css'];
                        return finalTo.replace($production, '');
                    }
                },{
                    from: 'assets/css/tox-images@2x.css',
                    to: function (matchedWord) {   // callback replacement
                        var finalTo = grunt.filerev.summary[$production + 'assets/css/' + $buildNameImages + '@2x.css'];
                        return finalTo.replace($production, '');
                    }
                }]
            }
        },
        filerev: {
            options: $options.filerev,
            dist: {
                src: [
                    // Base name
                    $production + 'assets/js/' + $buildName + '.js',
                    $production + 'assets/css/' + $buildName + '.css',

                    // Images
                    $production + 'assets/css/' + $buildNameImages + '.css',
                    $production + 'assets/css/' + $buildNameImages + '@2x.css'
                ]
            }
        },
        usemin: {
            html: [$production + 'index.html'],
            blockReplacements: {
                css: function(block) {
                    return '<link type="text/css" href="' + block.dest + '" rel="stylesheet" media="screen" />';
                },
                js: function(block) {
                    return '<script type="text/javascript" src="' + block.dest + '"></script>';
                }
            }
        }
    });

    grunt.registerTask('default', [
        'clean:oldDist', // Remove old directory
        'copy:developmentToProduction', // Copy development directory to production
        'imagemin', // Minify images
        'autoprefixer:homepage', // Add prefix in homepage CSS
        'imageEmbed:developmentToProduction', // Add minified images direcly in the CSS
        'imageEmbed:images', // Add minified images direcly in the CSS
        'imageEmbed:imagesRetina', // Add minified images direcly in the CSS (Retina)
        'useminPrepare', // Prepare minified files
        'concat:generated', // Concact files
        'cssmin:generated', // Minify CSS files
        'uglify:generated', // Minify JS files
        'filerev', // Add SHA1 hash on JS/CSS files
        'usemin', // Finish usemin operation
        'replace:cssPaths', // Change Retina css path in the homepage (hacks)
        'clean:newDist', // Clean the development directory
        'clean:tempDir' // Remove temp directories
    ]);
};