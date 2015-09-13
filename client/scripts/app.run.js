'use strict';

angular.module('YouAreHere')
  .run(['$rootScope', '$location', 'localStorageService', function($rootScope, $location, localStorageService) {
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    var isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null));
    var isiOS = isiPad || isiPhone;
    localStorageService.set('isiOS', isiOS);

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {
        var isBackBtn = (fromState.name === 'results' && toState.name === 'search' && !$rootScope.isSearchBtn);
        if (isBackBtn) {
          $rootScope.isSearchBtn = null;
          event.preventDefault();
        }
      }
    )
  }]);
