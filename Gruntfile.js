module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                globals: {
                    angular: true
                }
            }
        },
        ngtemplates:{
            'ambersive.routerui.menu':{
                module:     'ambersive.routerui.menu',
                src:        'src/views/**/*.html',
                dest:       'src/templates.js',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeComments:                 true, // Only if you don't use comment directives!
                        removeEmptyAttributes:          true,
                        removeRedundantAttributes:      true,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  true
                    }
                }
            }
        },
        concat:{
            'build':{
                src  : [
                    'src/*.js',
                ],
                dest : 'build/menu.js',
                filter: 'isFile'
            }
        },
        uglify:{
            build:{
                options: {
                    compress: {
                        drop_console: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['*.js', '!*.min.js'],
                    dest: 'build',
                    ext: '.min.js'
                }]
            }
        },
        watch: {
            files: ['src/*.js','src/views/**/*.html'],
            tasks: ['jshint','build']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['ngtemplates','concat','uglify']);

};