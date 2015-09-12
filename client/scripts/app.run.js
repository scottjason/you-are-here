'use strict';

angular.module('YouAreHere')
  .run(['localStorageService', function(localStorageService) {
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    var isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null));
    var isiOS = isiPad || isiPhone;
    localStorageService.set('isiOS', isiOS);
  }]);
