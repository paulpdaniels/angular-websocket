'use strict';

module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        concat : {
            dist : {
                files : {
                    'dist/ngWebSocket.js': ['bower_components/underscore/underscore.js', 'src/libs/rx.lite.js', 'src/ngWebSocket.js']
                }
            }
        },
        clean : {
            dist : {
                files : [{
                    dot : true,
                    src : ['dist/**']
                }]
            },
            server : '.tmp'
        },
        uglify : {
            dist : {
                files : { 'dist/ngWebSocket.min.js' : [ 'dist/ngWebSocket.js']}
            }
        },
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            all : ['Gruntfile.js', 'src/*.js']
        },
        copy : {
            main : {
                files : [
                    {expand : true, src: ['./bower.json'], dest: 'dist/', filter: 'isFile'},
                    {expand : true, src: ['./*md'], dest: 'dist/', filter : 'isFile'}
                ]
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'concat',
        'uglify',
        'copy'
    ]);

    grunt.registerTask('default', ['build']);


};