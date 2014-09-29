'use strict';

angular.module('pineappleGrappleApp').controller('NavbarCtrl', ['$scope', '$location', '$window', function ($scope, $location, $window) {
  $scope.siteName = 'Pineapple Grapple';
  $scope.menu = [{
    iconClass: 'fi-home',
    label: 'Home',
    link: '/',
    onClick: function () {}
  }, {
    iconClass: 'fi-social-github',
    label: 'Github',
    onClick: function() {
      $window.open('https://github.com/brutalhonesty/pineapple_grapple');
    }
  }, {
    iconClass: 'fi-info',
    label: 'About',
    link: '/about',
    onClick: function () {}
  }, {
    iconClass: 'fi-info',
    label: 'Docs',
    link: '/docs',
    onClick: function () {
      $window.open('/docs');
    }
  }];
  $scope.isActive = function(route) {
    return route === $location.path();
  };
}]);