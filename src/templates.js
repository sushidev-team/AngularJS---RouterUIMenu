angular.module('ambersive.routerui.menu').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/views/router.ui.menu.default.html',
    "<script type=text/ng-template id=navElementDefault.html><a ui-sref=\"{{child.name}}\" ><i ng-if=\"child.icon !== undefined && child.icon !== ''\" class=\"{{child.icon}}\"></i> {{child.label}}</a>\n" +
    "    <ul ng-if=\"child.children.length\" class=\"level_{{child.level}}\">\n" +
    "        <li ng-repeat=\"child in child.children\" ng-include=\"'navElementDefault.html'\" ui-sref-active=\"active\"></li>\n" +
    "    </ul></script><div class=navigation><ul class=\"nav nav-pills nav-stacked\"><li ng-repeat=\"nav in data\"><ul class=\"nav level_0\"><li ng-repeat=\"child in nav.children\" ng-include=\"'navElementDefault.html'\" ui-sref-active=active></li></ul></li></ul></div>"
  );

}]);
