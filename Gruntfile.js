/*global module:false*/
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),	
      
    uglify: {
		js: {
            files : {
                'build/js/form.min.js' : 'src/form.js',
                'build/js/jquery.form.min.js' : 'src/jquery.form.js',
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
    }   
   
  });
    
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
    
  grunt.registerTask('default', ['uglify', 'copy', 'watch']);

};
