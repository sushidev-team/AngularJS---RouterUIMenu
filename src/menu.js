/**
 * Menu directive/service for router-ui for AngularJS
 * @version v0.0.1.0
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {

    'use strict';

    angular.module('ambersive.routerui.menu',['ui.router','ambersive.routerui.auth']);

    angular.module('ambersive.routerui.menu').provider('$routerMenuSettings',[
        function(){

            var values = {
                template:'src/views/router.ui.menu.default.html'
            };

            return({
                setValue: function (name,value) {
                    if(values[name] === undefined){return;}
                    values[name] = value;
                },
                $get: function () {
                    return {
                        all:values,
                        template:values.template
                    };
                }
            });

        }
    ]);

    angular.module('ambersive.routerui.menu').config(['$urlRouterProvider',
        function($urlRouterProvider) {

        }
    ]);

    angular.module('ambersive.routerui.menu').run(['$rootScope','$state','$log','RouterUiMenuSrv',
        function($rootScope,$state,$log,RouterUiMenuSrv){

            var states          = $state.get(),
                statesAmount    = states.length,
                statesCount     = 0;

            states.forEach(function(state,index){

                statesCount++;

                if(state.menu !== undefined){
                    RouterUiMenuSrv.registerState(state);
                }

                if(statesAmount === statesCount){
                    RouterUiMenuSrv.sortGroups();
                }

            });

        }
    ]);

    angular.module('ambersive.routerui.menu').factory('RouterUiMenuSrv',['$q','$log','$state','$rootScope',
        function($q,$log,$state,$rootScope){

            var RouterUiMenuSrv = {},
                RouterUiGroupState = function(){
                    return {
                        name:'',
                        icon:'',
                        label:'',
                        sort:0,
                        hiddenAt:[],
                        visibleAt:[],
                        children:[]
                    };
                },
                RouterUiStateMap   = {},
                RouterUiGroupNames = {},
                sortFn = function(a,b){
                    if (a.sort < b.sort)
                        return -1;
                    else if (a.sort > b.sort)
                        return 1;
                    else
                        return 0;
                },
                Groups          = {},
                GroupsSorted    = [],
                User            = {};

            /**
             * Broadcasts
             */

            $rootScope.$on('$stateAuthenticationUser',function(event,args){
                User = args.user;
            });

            /**
             * Search a parent route in the
             * @param parentName
             * @returns {number}
             */

            RouterUiMenuSrv.findByParent = function(parentName){

                var index = -1;

                if(parentName === undefined) { return index; }

                var groupName = RouterUiMenuSrv.getGroupNameForState(parentName);
                if(groupName !== undefined){

                    var arr = Groups[groupName].children,
                        arrLength = arr.length;

                    for(var i=0;i<arrLength;i++){
                        if(arr[i].name === parentName){
                            index = i;
                            continue;
                        }
                    }

                }

                return index;

            };

            RouterUiMenuSrv.getStatesByParent = function (parentName,sort) {

                var states = $state.get();

                if(sort === undefined){
                    sort = true;
                }

                states = states.filter(function(state){
                    if (state.parent !== undefined && state.parent === parentName)
                    {
                        return state;
                    }
                });

                if(sort === true){

                    states = states.sort(sortFn);

                }

                return states;

            };

            RouterUiMenuSrv.getGroupNameForState = function(stateName){

                var state = $state.get(stateName);
                if(state.menu !== undefined && state.menu.group !== undefined){
                    return state.menu.group;
                } else {
                    return undefined;
                }

            };

            /***
             * Register a state to a group
             * @param state
             */

            RouterUiMenuSrv.registerState = function(state){

                if(state === undefined){$log.warn('ambersive.routerui.menu: error while register state. missing state object.'); return; }

                if(state.menu.group !== undefined && Groups[state.menu.group] === undefined){
                    Groups[state.menu.group] = {sort:0,children:[]};
                }

                var groupState      = new RouterUiGroupState(),
                    level           = 1;

                /**
                 * Loops a single entry through all its childstates
                 * @param name
                 * @returns {Array}
                 */

                var loopChildren    = function(name,parentState,level){

                    level++;

                    var children = [],
                        childStates = $state.get().filter(function(n){
                            if(n.parent === name){
                                return n;
                            }
                        });

                    childStates.forEach(function(value,index){

                        /**
                         * Insert the children and re-run the process
                         */

                        var child       = new RouterUiGroupState();
                        child.name      = value.name;
                        child.label     = value.menu.label;
                        child.icon      = value.menu.icon;
                        child.sort      = value.menu.sort;
                        child.hiddenAt  = value.menu.hiddenAt;
                        child.visibleAt = value.menu.visibleAt;
                        child.level     = level;

                        if(child.hiddenAt === undefined){
                            child.hiddenAt = [];
                        }

                        if(child.visibleAt === undefined){
                            child.visibleAt = [];
                        }

                        if(parentState.hiddenAt === undefined){
                            parentState.hiddenAt = [];
                        }

                        if(parentState.hiddenAt !== undefined) {
                            child.hiddenAt = child.hiddenAt.concat(parentState.hiddenAt);
                        }
                        if(parentState.visibleAt !== undefined) {
                            child.visibleAt = child.visibleAt.concat(parentState.visibleAt);
                        }

                        child.children  = loopChildren(child.name,child,level);

                        children.push(child);

                    });

                    return children;
                };

                groupState.name         = state.name;
                groupState.label        = state.menu.label;
                groupState.icon         = state.menu.icon;
                groupState.sort         = state.menu.sort;
                groupState.hiddenAt     = state.menu.hiddenAt;
                groupState.visibleAt    = state.menu.visibleAt;
                groupState.level        = level;

                if(state.menu.group !== undefined) {

                    groupState.children = loopChildren(state.name,groupState,level);
                    Groups[state.menu.group].children.push(groupState);
                }


                return Groups[state.menu.group];

            };

            /**
             *
             */

            RouterUiMenuSrv.check = function(ele,e){



                if(User.roles === undefined){
                    return ele;
                }

                var settings = this;

                var check = function(n){


                    var stop    = false,
                        visible = true,
                        state   = $state.get(n.name),
                        checkRole   = function(role){
                            var hasRole     = false;
                            if(User.roles !== undefined && User.roles.indexOf(role) > -1){
                                hasRole = true;
                            }
                            return hasRole;
                        },
                        checkState = function(state){

                            var hasState = false,
                                current  = $state.current.name;

                            if(state === undefined){
                                return;
                            }

                            if(current.indexOf(state) > -1){
                                hasState = true;
                            }

                            return hasState;

                        },
                        currentAtHidden     = false,
                        currentAtVisible    = false;


                    if(n.children !== undefined && n.children.length > 0){
                        n.children = n.children.filter(check);
                    } else {
                        if(state.data !== undefined && state.data.roles !== undefined){
                            if(state.data.roles.length === 0){
                                visible = true;
                            } else {
                                visible = state.data.roles.some(checkRole);
                            }
                        }
                    }

                    if(settings.maxLevel !== undefined && settings.maxLevel < n.level){
                        return;
                    }

                    if(stop === true || visible === false){
                        return;
                    }

                    /**
                     * Check the visibility of each single entry
                     */

                    if(n.visibleAt !== undefined && angular.isArray(n.visibleAt)){

                        currentAtVisible =  n.visibleAt.some(checkState);

                        if(currentAtVisible === true){
                            return n;
                        }

                    }

                    if(n.hiddenAt !== undefined && angular.isArray(n.hiddenAt)){
                        currentAtHidden =  n.hiddenAt.some(checkState);
                        if(currentAtHidden === true){
                            return;
                        }
                    }

                    return n;
                };


                if(ele.children !== undefined && ele.children.length > 0){
                    ele.children = ele.children.filter(check);
                } else {
                    return ele;
                }

                return ele;
            };

            /**
             * Sort the registered groups
             * @returns {Array}
             */

            RouterUiMenuSrv.sortGroups = function(){

                GroupsSorted = [];

                for(var group in Groups){

                    Groups[group].name = group;
                    Groups[group].label = RouterUiMenuSrv.getGroupLabel(group);
                    Groups[group].children.sort(sortFn);

                    GroupsSorted.push(Groups[group]);

                }

                return GroupsSorted;

            };

            /***
             * Get a single group
             * @param group
             * @returns {*}
             */

            RouterUiMenuSrv.getGroup = function(group){
                if(group === undefined){
                    return Groups;
                } else {
                    return Groups[group];
                }
            };

            /***
             * Get the sorted groups
             * @returns {Array}
             */

            RouterUiMenuSrv.getSortedGroup = function(){
                return GroupsSorted;
            };

            /**
             * Set Group Labels
             * @param name
             * @param value
             * @returns {*}
             */

            RouterUiMenuSrv.setGroupLabel = function(name,value){
                RouterUiGroupNames[name] = value;
                return RouterUiGroupNames[name];
            };

            /***
             * Get Group Labels
             * @param name
             * @returns {*}
             */

            RouterUiMenuSrv.getGroupLabel = function(name){
                if(RouterUiGroupNames[name] !== undefined){
                    return RouterUiGroupNames[name];
                } else {
                    return name;
                }
            };

            return RouterUiMenuSrv;

        }
    ]);

    angular.module('ambersive.routerui.menu').directive('routerUiMenuGroups',['$compile','RouterUiMenuSrv',
        function($compile,RouterUiMenuSrv){

            var directive = {};

            directive.restrict = 'E';

            directive.scope = {
                group:'@',
                template:'@',
                levels:'@?'
            };

            directive.replace = true;

            directive.transclude = true;

            directive.controller = ['$compile','$scope','$state','$element','$log','$timeout','$templateCache','$http','RouterUiMenuSrv','$routerMenuSettings','Auth',
                function($compile,$scope,$state,$element,$log,$timeout,$templateCache,$http,RouterUiMenuSrv,$routerMenuSettings,Auth){

                    var routerUiMenu    = this,
                        User            = {};

                    $scope.data = [];
                    $scope.getTemplateByUrl = false;

                    /**
                     * Get parameters
                     */

                    if($scope.group !== undefined){ routerUiMenu.group = $scope.group;}
                    if($scope.template !== undefined){ routerUiMenu.templateUrl = $scope.template;} else { routerUiMenu.templateUrl = $routerMenuSettings.template;}

                    /**
                     * Broadcasts
                     */

                    $scope.$on('$stateAuthenticationUser',function(event,args){
                        User = args.user;
                        routerUiMenu.getData();
                        $timeout(function(){
                            $scope.$apply();
                        },100);
                    });

                    $scope.$on('$stateChangeSuccess',
                        function(event, toState, toParams, fromState, fromParams){
                            routerUiMenu.getData();
                        }
                    );

                    /**
                     * Functions
                     */

                    $scope.warn = function(msg){
                        $log.warn(msg);
                    };

                    routerUiMenu.getData = function(){

                        if(User.roles === undefined){
                            return;
                        }

                        var groups          = [],
                            groupsFilter    = [];


                        if(routerUiMenu.group !== undefined){
                            groups = [RouterUiMenuSrv.getGroup(routerUiMenu.group)];
                        } else {
                            groups = RouterUiMenuSrv.getSortedGroup();
                        }

                        var copy = angular.copy(groups),
                            settings = {};

                        if($scope.levels !== undefined){
                            settings.maxLevel = parseInt($scope.levels);
                        }

                        $scope.data = copy.filter(RouterUiMenuSrv.check,settings);

                    };

                    routerUiMenu.init = function(){


                        var template    = null,
                            templateUrl = null;

                        /**
                         * Get Template
                         */

                        template = $templateCache.get(routerUiMenu.templateUrl);

                        if(template === undefined){

                            $scope.getTemplateByUrl = true;

                            $http.get(routerUiMenu.templateUrl, {}).then(function(result){
                                if(result.status === 200){
                                    template = result.data;

                                    $element.html(template);
                                    $element.replaceWith($compile($element.html())($scope));

                                } else {
                                    $scope.warn('ambersive.routerui.menu: $http loading template failed');
                                }
                            }, function(){
                                $scope.warn('ambersive.routerui.menu: $http loading template failed');
                            });

                        }

                        $scope.templateHtml = template;

                        /**
                         * Get data
                         */

                        Auth.callAPI().then(function(){
                            routerUiMenu.getData();
                        });

                    };

                    routerUiMenu.init();

                }
            ];

            directive.link = function(scope,element,attrs){
                try {

                    if(scope.getTemplateByUrl === true){
                        return;
                    }

                    if(scope.templateHtml === undefined){
                        scope.warn('ambersive.routerui.menu: template is undefined');
                        return;
                    }

                    element.html(scope.templateHtml);
                    element.replaceWith($compile(element.html())(scope));

                } catch(err){
                    scope.warn(err);
                }
            };

            return directive;
        }
    ]);

})(window, document, undefined);