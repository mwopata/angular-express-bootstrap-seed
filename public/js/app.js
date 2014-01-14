'use strict';
var serverurl = ''
if (location.host[0]=='l' || location.host[0]=='1'){
  serverurl= 'https://friendpert-dev.firebaseio.com';
}
else{
  serverurl = 'https://friendpert.firebaseio.com'
}
// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngRoute', 'firebase', 'ngResource']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/myfriendperts', {
      templateUrl: 'partial/myfriendperts',
      controller: 'MyFriendpertsCtrl',
      resolve:
      {
        prepData: AppCtrl.prepData
      }
      });
    $routeProvider.when('/home', {
      templateUrl: 'partial/home',
      controller: HomeCtrl,
      resolve:
      {
        prepData: AppCtrl.prepData
      }});
    $routeProvider.when('/answers', {
      templateUrl: 'partial/answers',
      controller: AnswersCtrl,
      resolve:
      {
        prepData: AppCtrl.prepData
      }});
    $routeProvider.when('/asks', {
      templateUrl: 'partial/asks',
      controller: AsksCtrl,
      resolve:
      {
        prepData: AppCtrl.prepData
      }});
    $routeProvider.when('/fbpage', {
      templateUrl: 'partial/fblist',
      controller: AppCtrl,
      resolve:
        {
          prepData: AppCtrl.prepData
        }
      })
    $routeProvider.when('/dbedit', {
      templateUrl: 'partial/dbedit',
      controller: DbeditCtrl,
      resolve:
      {
        prepData: AppCtrl.prepData
      }
    })
    $routeProvider.when('/signin',
      {templateUrl: 'partial/3',
        controller: SigninCtrl,
        resolve:
        {
          prepData: AppCtrl.prepData
        }});
    $routeProvider.otherwise({redirectTo: '/home'});
    $locationProvider.html5Mode(true);
  }])
  //Why isn't usrArr set here?
  .run(['angularFireAuth', 'FBURL', '$rootScope',
    function(angularFireAuth, FBURL, $rootScope) {
      angularFireAuth.initialize(new Firebase(FBURL), {scope: $rootScope, name: 'auth', path: '/signin'});
      $rootScope.FBURL = FBURL;
      console.log("Rootscope is set now:")
      $rootScope.$apply();
      $rootScope.linkArr = [];
    }])

  .constant('FBURL', serverurl);