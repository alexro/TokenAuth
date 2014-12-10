'use strict';

describe('Auth service', function () {
    var $window,
        $httpBackend,
        Auth;

    beforeEach(module('App'));

    beforeEach(inject(function (_$window_, _$httpBackend_, _Auth_) {
        $window = _$window_;
        $httpBackend = _$httpBackend_;
        Auth = _Auth_;

        $window.sessionStorage.clear();
    }));

    it('should return empty token', function () {
        expect(Auth.getToken()).not.toBeDefined();
    });

    it('should authenticate and set the token', function () {
        $httpBackend.expectPOST('/authenticate').respond('{ "token":"123" }');
        Auth.login({}, function () {
        });

        $httpBackend.flush();
        expect(Auth.getToken()).toEqual('123');
    });

    it('should logout and remove the token', function () {
        $window.sessionStorage.token = '123';
        Auth.logout();
        expect(Auth.getToken()).not.toBeDefined();
    });
});

describe('Data service', function () {
    var $httpBackend,
        Data;

    beforeEach(module('App'));

    beforeEach(inject(function (_$httpBackend_, _Data_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', '/api/data').respond([{ip: '1'}, {ip: '2'}]);

        Data = _Data_;
    }));

    it('should return data', function () {
        var data = [];
        Data.getData(function (results) {
            data = results;
        });

        $httpBackend.flush();
        expect(data.length).toEqual(2);
    });
});

describe('MainController', function () {
    var scope,
        _$state_,
        _Auth_,
        _Data_,
        _$controller_,
        ctrl;

    beforeEach(module('App'));

    beforeEach(inject(function ($window, $rootScope, $controller) {
        scope = $rootScope.$new();
        _$state_ = new StateMock();
        _Auth_ = new AuthMock();
        _Data_ = new DataMock();
        $window.sessionStorage.clear();
        _$controller_ = $controller;
    }));

    it('should goto login page initially', function () {
        ctrl = _$controller_('MainController', {$scope: scope, $state: _$state_, Auth: _Auth_, Data: _Data_});
        expect(_$state_.location).toEqual('login');
    });

    it('should login as admin and grab data', function () {
        _Auth_.token = adminToken;
        ctrl = _$controller_('MainController', {$scope: scope, $state: _$state_, Auth: _Auth_, Data: _Data_});
        expect(ctrl.userName).toEqual('admin');
        expect(ctrl.data.length).toEqual(1);
    });

    it('should login as user and do not grab data', function () {
        _Auth_.token = userToken;
        ctrl = _$controller_('MainController', {$scope: scope, $state: _$state_, Auth: _Auth_, Data: _Data_});
        expect(ctrl.userName).toEqual('user');
        expect(ctrl.data.length).toEqual(0);
    });

    it('should login out, clear takoen and data, goto login', function () {
        _Auth_.token = userToken;
        ctrl = _$controller_('MainController', {$scope: scope, $state: _$state_, Auth: _Auth_, Data: _Data_});
        ctrl.logout();

        expect(_Auth_.token).not.toBeDefined();

        expect(ctrl.userName).toEqual('');
        expect(ctrl.data.length).toEqual(0);

        expect(_$state_.location).toEqual('login');
    })
});

describe('LoginController', function () {
    var _$state_,
        _Auth_,
        ctrl;

    beforeEach(module('App'));

    beforeEach(inject(function ($rootScope, $controller) {
        _$state_ = new StateMock();
        _Auth_ = new AuthMock();

        ctrl = $controller('LoginController', {$state: _$state_, Auth: _Auth_});
    }));

    it('should login and goto main page', function () {
        ctrl.login();
        expect(_$state_.location).toEqual('main');
    });
});

var adminToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFkbWluIiwiaWF0IjoxNDE3MTgwNjkzLCJleHAiOjE0MTcxOTg2OTN9.4T0W5S9-ATMjTBqwGTpv-x1MleKH9ORXuAuMBi_mQ4g';
var userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6InVzZXIiLCJpYXQiOjE0MTcxODUyNDYsImV4cCI6MTQxNzIwMzI0Nn0.A7Q9mz7q7DEk4QVmZOfRMEPXqG-l4optCUQvtHLvvV8';

function AuthMock() {
    this.token;

    this.getToken = function() {
        return this.token;
    }

    this.login = function (user, callback) {
        callback();
    }

    this.logout = function () {
        delete this.token;
    }
}

function DataMock() {
    this.getData = function (callback) {
        callback([
            {
                ip: 'ip',
                timestamp: 'timestamp',
                action: 'action',
                username: 'username'
            }
        ]);
    }
}

function StateMock() {
    this.go = function (location) {
        this.location = location;
    }
}