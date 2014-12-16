module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: 'dist/'
        },
        copy: {
            src: {
                expand: true,
                cwd: 'src/',
                src: ['**'],
                dest: 'dist/'
            },
        },
        useminPrepare: {
            html: 'dist/index.html',
            options: {
                root: 'HTML',
                dest: 'dist'
            }
        },
        usemin: {
            html: 'dist/index.html',
        },
        filerev: {
            options: {
                algorithm: 'sha1',
                length: 40
            },
            dist: {
                src: [
                    'dist/assets/js/*.js',
                    'dist/assets/css/*.css'
                    //'dist/assets/fonts/*'
                ]
            }
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
        'clean',
        'copy:src',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev:',
        'usemin'
    ]);
    grunt.registerTask('default', ['build']);
};