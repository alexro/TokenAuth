module.exports = function(config) {
  config.set({

    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/client/public/components/angular/angular.min.js',
      'src/client/public/components/angular-ui-router/release/angular-ui-router.min.js',
      'src/client/public/components/angular-mocks/angular-mocks.js',
      'src/client/public/js/**/*.js',
      'src/client/public/js/**/*.spec.js'
    ],
    browsers: ['Chrome'],
    singleRun: true,
    reporters: ['progress'],
    preprocessors: {
      "src/client/public/js/**/*.js": 'coverage'
    }

  });
};
