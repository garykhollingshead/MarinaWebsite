(function() {
  "use strict";

  // Require 3rd party modules
  var angular = require("angular");
  require("angular-animate");
  require("angular-aria");
  require("angular-cookies");
  require("angular-messages");
  require("angular-resource");
  require("angular-route");
  require("angular-sanitize");
  require("angular-material");
  require("angular-ui-router");
  require("ng-notifications-bar");
  require("angular-material-data-table");

  // Export and configure the app
  module.exports = angular.module("mainApp", [
    "ngAnimate",
    "ngAria",
    "ngCookies",
    "ngMessages",
    "ngResource",
    "ngRoute",
    "ngSanitize",
    "ngMaterial",
    "md.data.table",
    "ui.router",
    "ngNotificationsBar"
  ]).config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when("", "/");
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state("homePage", {
        url: "/",
        templateUrl: "views/homePage/homePage.html"
      })
      .state("home", {
        url: "/home",
        templateUrl: "views/home.html"
      })
      .state("videos", {
        url: "/videos",
        templateUrl: "views/videos.html"
      })
      .state("pricing", {
        url: "/pricing",
        templateUrl: "views/pricing.html"
      })
      .state("contact", {
        url: "/contact",
        templateUrl: "views/contact.html"
      });
  });

  // Wire-up the app modules
//  require("./common");
})();
