module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.initConfig({
        ts: {
            default: {
                src: ["**/*.ts", "!node_modules/**", '!bin/**'],
                options: {
                    module: 'commonjs',
                    target: 'es2015'
                }
            }
        },
        clean: {
            all: ['**/*.js', '**/*.js.map', '!node_modules/**', '!Gruntfile.js', '!bin/**', 'test/**/*.js', 'test/**/*.js.map', '*.tmp.txt']
        },
        tslint: {
            options: {
                configuration: "tslint.json",
                force: true,
                fix: true
            },
            files: {
                src: ['routes/*.ts', './*.ts', 'models/*.ts', 'data/*.ts', '!node_modules/**']
            }
        }
    });

    grunt.registerTask('default', ['clean', 'tslint', 'ts']);
};