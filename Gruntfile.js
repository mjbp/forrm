/*global module:false*/
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	js_src_path: 'src/',
    js_build_path: "build/js",
	
      
    uglify: {
		js: {
			src: '<%= js_src_path %>',
			dest:'<%= js_build_path %>/*.js'
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
