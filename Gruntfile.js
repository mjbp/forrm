/*global module:false*/
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),	
      
    uglify: {
		js: {
            files : {
                'build/js/forrm.min.js' : 'src/forrm.js'
            }
		}
    },
    copy: {
        files : {
           expand: true,
           cwd: 'src',
           src: '*',
           dest: 'build/js'
        }
    },
    watch: {
        files : ['src/*.js'],
        tasks : ['uglify', 'copy']
    },
    mocha: {
      all: {
        src: ['tests/testrunner.html'],
      },
      options: {
        run: true
      }
    }
   
  });
    
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');
    
  grunt.registerTask('default', ['uglify', 'copy', 'watch']);
  grunt.registerTask('test', ['mocha']);

};
