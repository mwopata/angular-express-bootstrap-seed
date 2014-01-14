'use strict';

/* Directives */


angular.module('myApp.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('appField',['fieldval', function(fieldval){
    return function(scope, elm, attrs) {
      elm.text(fieldval)
    }
  }])
  .directive('enter', function(){
    return function(scope, element){
      element.bind("mouseenter", function(){
        console.log("I'm inside of you2")
      })
    }
  })
  .directive('currentlink', function($location){
    return {
      //If you don't use a restrict, it defaults to A
      restrict: "A",
      //
      link: function(scope, element, attrs){
        if(element[0].pathname==$location.$$url){
          console.log("Pathname and url are equal")
          console.log(element[0].pathname)
          element.css({
          })
        }
        element.bind("click", function(){
          console.log(element[0].pathname + $location.$$url)
          if(element[0].pathname==$location.$$url){
            console.log("Pathname and url are equal")
            console.log(element[0].pathname)
            element.css({
            })
          }
          else{
            element.css({
            })
          }
        })
      }
    }
  })
