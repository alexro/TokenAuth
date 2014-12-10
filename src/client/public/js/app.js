'use strict';

angular.module('App', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('main', {
                url: "/",
                templateUrl: "views/main.html",
                controller: 'MainController',
                controllerAs: 'mainCtrl'
            })

            .state('login', {
                url: "/login",
                templateUrl: "views/login.html",
                controller: 'LoginController',
                controllerAs: 'loginCtrl'
            });

        $httpProvider.interceptors.push('authInterceptor');
    })
    .factory('authInterceptor', function ($rootScope, $q, $window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $window.alert('Unauthorized');
                }
                return $q.reject(rejection);
            }
        };
    })
    .service('Auth', [
        '$window',
        '$http',
        function ($window, $http) {

            this.login = function (user, callback) {
                $http
                    .post('/authenticate', user)
                    .success(function (data, status, headers, config) {
                        $window.sessionStorage.token = data.token;
                        callback();
                    })
                    .error(function (data, status, headers, config) {
                        delete $window.sessionStorage.token;
                    });
            };

            this.getToken = function () {
                return $window.sessionStorage.token;
            };

            this.logout = function () {
                delete $window.sessionStorage.token;
            }
        }
    ])
    .service('Data', [
        '$http',
        function ($http) {

            this.getData = function (callback) {
                $http({url: '/api/data', method: 'GET'})
                    .success(function (data, status, headers, config) {
                        callback(data);
                    })
                    .error(function (data, status, headers, config) {
                        alert(data);
                    });
            }
        }
    ])
    .controller('MainController', [
        '$scope',
        '$state',
        'Auth',
        'Data',
        function ($scope, $state, Auth, Data) {
            var self = this;

            if (!Auth.getToken()) {
                $state.go('login');
                return;
            }

            var encodedProfile = Auth.getToken().split('.')[1];
            var profile = JSON.parse(url_base64_decode(encodedProfile));

            self.userName = profile.id;
            self.data = [];

            if (self.userName === 'admin') {
                Data.getData(function (data) {
                    self.data = data;
                })
            };

            self.logout = function () {
                Auth.logout();
                self.data = [];
                self.userName = '';
                $state.go('login');
            };
        }
    ])
    .controller('LoginController', [
        '$state',
        'Auth',
        function ($state, Auth) {
            this.username = '';
            this.password = '';

            this.login = function () {
                Auth.login({username: this.username, password: this.password}, function () {
                    $state.go('main');
                });
            }
        }
    ]);

function url_base64_decode(str) {
    var output = str.replace('-', '+').replace('_', '/');

    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }

    return window.atob(output);
}