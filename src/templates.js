angular.module('ambersive.routerui.menu').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/views/router.ui.menu.default.html',
    "<script type=text/ng-template id=navElement.html><a ui-sref=\"{{child.name}}\" >{{child.label}}</a>\n" +
    "    <ul ng-if=\"child.children.length\">\n" +
    "        <li ng-repeat=\"child in child.children\" ng-include=\"'navElement.html'\" ui-sref-active=\"active\"></li>\n" +
    "    </ul></script><div class=navigation><ul class=\"nav nav-pills nav-stacked\"><li ng-repeat=\"nav in data\"><ul class=nav><li ng-repeat=\"child in nav.children\" ng-include=\"'navElement.html'\" ui-sref-active=active></li></ul></li></ul></div>"
  );

}]);
