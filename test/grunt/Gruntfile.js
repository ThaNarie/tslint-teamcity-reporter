module.exports = grunt => {
  grunt.loadNpmTasks('grunt-tslint');

  grunt.initConfig({
    tslint: {
      options: {
        configuration: '../_fixtures/tslint.json',
        formatter: 'tslint-teamcity-reporter',
      },
      default: {
        src: ['../_fixtures/test1.ts', '../_fixtures/test2.ts'],
      },
    },
  });

  grunt.registerTask('default', ['lint']);
  grunt.registerTask('lint', ['tslint']);
};
