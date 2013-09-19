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
    watch: {
        files : ['<%= js_src_path %>/*.js'],
        tasks : ['uglify']
    }   
   
  });
    
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
    
  grunt.registerTask('watch', ['uglify']);
  grunt.registerTask('default', ['uglify']);

};
