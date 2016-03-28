# ROUTER-UI Menu - AngularJS Service

An AngularJS (1.5) service for adding an menu. Based on the [AuthSrv](https://github.com/AMBERSIVE/AngularJS---AuthSrv) this module provides a flexible navigation.

### Version
0.0.2.1

### Installation

#### Step 1

```sh
$ bower install ambersive-router-ui-menu
```
#### Step 2
You first have to declare the 'ambersive.routerui.menu' module dependency inside your app module (perhaps inside your app main module).
Please be aware, that you need ui.router and our authentication module (ambersive.routerui.auth)!

```sh
angular.module('app', ['ambersive.routerui.menu','ambersive.routerui.auth']);
```
### Configuration

Please be aware, that you need the basic configuration of ['ambersive.routerui.auth'](https://github.com/AMBERSIVE/AngularJS---AuthSrv). Otherwise the module will throw an error.

### Useage

You need to add an object to your state. (menu). It is possible to add a label and define the group, the order (sort) and states where the specific state will be visible or hidden.
If you define roles the specific entry will only be visible (and accessable) for user with this role.

```sh
$stateProvider
     .state('app.state1', {
          url:'/state1',
          views: {
              'main': {
                  template: '<div>state 1</div>'
              }
          },
          data:{
            roles:[]
          },
          menu:{
              label:'State 1',
              group:'main',
              sort:100,
              icon:'',
              hiddenAt:[],
              visibleAt:[]
          }
     });
```

To show the navigation you can use the directive provided by this module.

```sh
<router-ui-menu-groups></router-ui-menu-groups>
```

### Options

The directive provides some options for a customization.

#### Group

To access only a specific group add the group parameter (String)

```sh
    <router-ui-menu-groups group="main"></router-ui-menu-groups>
```

#### Template

To use a custom template you need to define a template url. $templateCache support provided (and recommended)

```sh
    <router-ui-menu-groups template="PATH to Template"></router-ui-menu-groups>
```

#### Levels

To limit the level shown add the levels attribute to the directive. The ground level = 0;

```sh
    <router-ui-menu-groups levels="1"></router-ui-menu-groups>
```

License
----
MIT