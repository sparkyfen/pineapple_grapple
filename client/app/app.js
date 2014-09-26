'use strict';

angular.module('pineappleGrappleApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'mm.foundation'
]).config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
});