/*******************************************************************************
 * Copyright (C) 2020, exense GmbH
 *
 * This file is part of STEP
 *
 * STEP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * STEP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with STEP.  If not, see <http://www.gnu.org/licenses/>.
 *******************************************************************************/
var tecAdminApp = angular
  .module('tecAdminApp', [
    'step',
    'entities',
    'tecAdminControllers',
    'gridControllers',
    'repositoryControllers',
    'executionsControllers',
    'screenConfigurationControllers',
    'dashboardsControllers',
    'asyncTask',
  ])

  .config([
    '$locationProvider',
    function ($locationProvider) {
      $locationProvider.hashPrefix('');
    },
  ])

  .config([
    '$compileProvider',
    function ($compileProvider) {
      // Unfortunately required to retrieve scope from elements: angular.element(\'#MyCtrl\').scope()
      $compileProvider.debugInfoEnabled(true);
      //$compileProvider.commentDirectivesEnabled(false);
      //$compileProvider.cssClassDirectivesEnabled(false);
    },
  ])

  .config([
    '$httpProvider',
    function ($httpProvider) {
      //initialize get if not there
      if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
      }

      // Answer edited to include suggestions from comments
      // because previous version of code introduced browser-related errors

      //disable IE ajax request caching
      $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
      // extra
      $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
      $httpProvider.defaults.withCredentials = true;
      $httpProvider.interceptors.push('authInterceptor');
      $httpProvider.interceptors.push('genericErrorInterceptor');
      $httpProvider.interceptors.push('httpRequestInterceptor');
    },
  ])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerView('login', 'partials/loginForm.html', true);
  })

  .controller(
    'AppController',
    [
      '$rootScope',
      '$scope',
      '$location',
      '$http',
      'stateStorage',
      'AuthService',
      'ViewRegistry',
      'ViewState',
      'navigatorService',
      function (
        $rootScope,
        $scope,
        $location,
        $http,
        stateStorage,
        AuthService,
        ViewRegistry,
        ViewState,
        navigatorService
      ) {
        stateStorage.push($scope, 'root', {});

        $rootScope.isInitialized = false;
        AuthService.initialize$.subscribe(() => {
          $rootScope.isInitialized = true;

          $scope.logo = '../../../images/logotopleft.png';
          if (!$location.path()) {
            navigatorService.navigateToHome();
          }
          $scope.$apply();
        });

        $scope.$watch(function () {
          $scope.isAllTenant = $location.search().tenant === '[All]';
          $scope.isNoTenant = $location.search().tenant === '[None]';
        });

        $scope.$watch('$state', function (newValue) {
          ViewState.setView(newValue);
        });

        $scope.setView = function (view) {
          ViewState.setView(view);
          $scope.$state = view;
          stateStorage.store($scope, {lastview: view});
        };

        $scope.isViewActive = function (view) {
          return ViewState.isViewActive(view);
        };

        $scope.getViewTemplate = function () {
          return ViewState.viewTemplate;
        };

        $scope.isPublicView = function () {
          return ViewState.isPublicView;
        };

        $scope.isStaticView = function () {
          return ViewState.isStaticView;
        };

        $scope.authService = AuthService;
        $scope.viewRegistry = ViewRegistry;

        $scope.adminAlerts = ViewRegistry.getDashlets('admin/alerts');

        function handleKeys(e) {
          if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            $rootScope.$broadcast('undo-requested');
          } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
            $rootScope.$broadcast('redo-requested');
          }
        }

        document.body.addEventListener('keydown', handleKeys);
        $scope.$on('$destroy', function () {
          document.body.removeEventListener('keydown', handleKeys);
        });

      }]
  )

  .directive('rootContent', function () {
    return {
      restrict: 'A',
      scope: true,
      controller: 'AppController',
      templateUrl: 'partials/root.html'
    };
  })

  .directive('ngCompiledInclude', function ($compile, $templateCache, $http) {
    return {
      restrict: 'A',
      priority: 400,
      compile: function (element, attrs) {
        var templatePath = attrs.ngCompiledInclude;
        return function (scope, element) {
          $http.get(templatePath, {cache: $templateCache}).then(function (response) {
            var contents = element.html(response).contents();
            $compile(contents)(scope);
          });
        };
      },
    };
  });

angular
  .module('step', ['ngStorage', 'ngCookies', 'angularResizable'])

  .service('helpers', function ($rootScope) {
    this.formatAsKeyValueList = function (obj) {
      var result = '';
      _.each(_.keys(obj), function (key) {
        result += key + '=' + JSON.stringify(obj[key]) + ', ';
      });
      return result;
    };

    this.getProjectById = (id) => {
      for (let tenant of $rootScope.tenants) {
        if (tenant.projectId === id) {
          return tenant;
        }
      }
    };
  })

  .service('pathHelper', ['$timeout', '$location', function ($timeout, $location) {
    this.fixList = function () {
      $timeout(function () {
        if (!$location.path().endsWith('list')) {
          const newPath = $location.path() + '/list';
          $location.url(newPath).replace();
        }
      }, 100);
    };
  }])
  .service('stateStorage', function ($localStorage, $rootScope, $location, $timeout, $cookies, AuthService) {
    $rootScope.$$statepath = [];

    this.localStore = {};

    this.persistState = false;

    function debug() {
      return AuthService.debug();
    }

    var lockLocationChangesUntilPathIsReached = function (targetPath) {
      if (!$rootScope.locationChangeBlocked) {
        $rootScope.locationChangeBlocked = true;
        if (debug()) {
          console.log('Locking location changes until ' + targetPath.join('/') + ' is reached');
        }
        var unbind = $rootScope.$watch(function () {
          if (_.isEqual(targetPath, $rootScope.currentPath)) {
            if (debug()) {
              console.log('Unlocking location changes');
            }
            $rootScope.locationChangeBlocked = false;
            unbind();
          }
        });
      }
    };

    if ($location.path()) {
      lockLocationChangesUntilPathIsReached($location.path().substr(1).split('/'));
    }

    $rootScope.$on('$locationChangeStart', function (event) {
      if ($location.path()) {
        lockLocationChangesUntilPathIsReached($location.path().substr(1).split('/'));
      }
    });

    this.push = function ($scope, ctrlID, defaults) {
      if ($scope.hasOwnProperty('$$statepath')) {
        $scope.$$statepath.pop();
        $scope.$$statepath.push(ctrlID);

        var path = $location.path().substr(1).split('/');

        if (_.isEqual(path.slice(0, $scope.$$statepath.length), $scope.$$statepath)) {
          if (debug()) {
            console.log(
              'existing scope pushed. id:' +
              $scope.$id +
              '. Path matched. Setting $state. path ' +
              path.slice($scope.$$statepath.length, $scope.$$statepath.length + 1)[0]
            );
          }
          $scope.$state = path.slice($scope.$$statepath.length, $scope.$$statepath.length + 1)[0];
        }
      } else {
        if (debug()) {
          console.log('new scope pushed. id:' + $scope.$id + ' ctrlID: ' + ctrlID);
        }
        $scope.$state = null;

        var currentScope = $scope;
        while (currentScope.$$statepath == null) {
          currentScope = currentScope.$parent;
        }
        var parentStatepath = currentScope.$$statepath;
        $scope.$$statepath = parentStatepath.slice();
        $scope.$$statepath.push(ctrlID);

        var path = $location.path().substr(1).split('/');
        if (_.isEqual(path.slice(0, $scope.$$statepath.length), $scope.$$statepath)) {
          if (debug()) {
            console.log(
              'new scope pushed. id:' +
              $scope.$id +
              '. Path matched. Setting $state. path ' +
              path.slice($scope.$$statepath.length, $scope.$$statepath.length + 1)[0]
            );
          }
          $scope.$state = path.slice($scope.$$statepath.length, $scope.$$statepath.length + 1)[0];
        }

        $scope.$on('$locationChangeStart', function () {
          var path = $location.path().substr(1).split('/');
          if (_.isEqual(path.slice(0, $scope.$$statepath.length), $scope.$$statepath)) {
            if (debug()) {
              console.log(
                'scope ' +
                $scope.$id +
                ' remains selected after path change. new path ' +
                path.slice(0, $scope.$$statepath.length).toString() +
                ' scope path:' +
                $scope.$$statepath.toString()
              );
            }
            $scope.$state = path.slice($scope.$$statepath.length, $scope.$$statepath.length + 1)[0];
          } else {
            if (debug()) {
              console.log('scope ' + $scope.$id + ' unselected but not destroyed. setting state to null');
            }
            $scope.$state = null;
          }
        });

        $scope.$watch('$state', function (newStatus, oldStatus) {
          if (newStatus != null) {
            var newPath = $scope.$$statepath.slice();
            newPath.push(newStatus);
            if (debug()) {
              console.log('changing current path  to ' + newPath);
            }
            $rootScope.currentPath = newPath;
            if (!$rootScope.locationChangeBlocked) {
              $location.path(newPath.join('/'));
            }
          }
        });

        if (this.get($scope) == null) {
          this.store($scope, defaults);
        }
      }
    };
    this.get = function ($scope, key) {
      var k = key ? key : $scope.$$statepath.join('.');
      if (this.persistState) {
        return $cookies[k];
      } else {
        return this.localStore[k];
      }
    };

    this.store = function ($scope, model, key) {
      var k = key ? key : $scope.$$statepath.join('.');
      if (this.persistState) {
        $cookies[k] = model;
      } else {
        this.localStore[k] = model;
      }
    };
  })

  .factory('Preferences', function ($http) {
    var service = {};

    var preferences;

    service.load = function () {
      $http.get('rest/admin/myaccount/preferences').then(function (res) {
        preferences = res.data ? res.data.preferences : null;
      });
    };

    service.get = function (key, defaultValue) {
      var value = preferences ? preferences[key] : null;
      return value ? value : defaultValue;
    };

    service.put = function (key, value) {
      $http.post('rest/admin/myaccount/preferences/' + key, value).then(function (res) {
        if (!preferences) {
          preferences = {};
        }
        preferences[key] = value;
      });
    };

    return service;
  })

  .service('authInterceptor', function ($q, $rootScope) {
    // this interceptor is replaced for ng2+ modules with:
    // step-frontend/projects/step-frontend/src/lib/modules/_common/interceptors/auth.interceptor.ts
    var service = this;
    service.responseError = function (response) {
      if (response.status == 401) {
        $rootScope.context = {userID: 'anonymous'};
      }
      if (response.status == 403) {
        // error will be handled by genericErrorInterceptor
      }

      return $q.reject(response);
    };
  })

  .factory('ImportDialogs', function ($rootScope, $uibModal, EntityRegistry, $sce) {
    var dialogs = {};

    dialogs.displayImportDialog = function (title, path) {
      var modalInstance = $uibModal.open({
        backdrop: 'static',
        templateUrl: 'partials/importDialog.html',
        controller: 'importModalCtrl',
        resolve: {
          title: function () {
            return title;
          },
          path: function () {
            return path;
          },
          importAll: function () {
            return false;
          },
          overwrite: function () {
            return false;
          },
        },
      });
      return modalInstance.result;
    };

    return dialogs;
  })

  .controller(
    'importModalCtrl',
    function ($scope, $http, $uibModalInstance, Upload, Dialogs, title, path, importAll, overwrite) {
      $scope.title = title;
      $scope.path = path;
      $scope.importAll = importAll;
      $scope.overwrite = overwrite;
      $scope.resourcePath;

      $scope.save = function () {
        if ($scope.resourcePath) {
          $http({
            url: 'rest/import/' + path,
            method: 'POST',
            params: {path: $scope.resourcePath, importAll: $scope.importAll, overwrite: $scope.overwrite},
          }).then(function (response) {
            $uibModalInstance.close(response.data);
            if (response.data && response.data.length > 0) {
              Dialogs.showListOfMsgs(response.data);
            }
          });
        } else {
          Dialogs.showErrorMsg('Upload not completed.');
        }
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  )

  .factory('Dialogs', function ($rootScope, $uibModal, EntityRegistry, $sce) {
    var dialogs = {};

    /*
     * i = number of items
     * itemName (optional) the name of the item (often with the category in front)
     */
    dialogs.showDeleteWarning = function (i, itemName, secondaryText) {
      var msg;
      if (i == undefined || i == 1) {
        if (itemName) {
          msg = 'Are you sure you want to delete the ' + itemName + '?';
        } else {
          msg = 'Are you sure you want to delete this item?';
        }
      } else {
        msg = 'Are you sure you want to delete these ' + i + ' items?';
      }

      if (secondaryText) {
        msg += '\n\n' + secondaryText;
      }

      return dialogs.showWarning(msg);
    };

    dialogs.showEntityInAnotherProject = function (newProjectName) {
      var msg;
      if (newProjectName) {
        msg = 'This entity is part of the project "' + newProjectName + '". Do you wish to switch to this project?';
      } else {
        msg = 'This entity is part of another project. Do you wish to switch to this project?';
      }

      return dialogs.showWarning(msg);
    };

    dialogs.showWarning = function (msg) {
      var modalInstance = $uibModal.open({
        backdrop: 'static',
        animation: false,
        templateUrl: 'partials/confirmationDialog.html',
        controller: 'DialogCtrl',
        resolve: {
          message: function () {
            return msg;
          },
        },
      });
      return modalInstance.result;
    };


    dialogs.showErrorMsg = function (msg, callback) {
      var modalInstance = $uibModal
        .open({
          backdrop: 'static',
          animation: false,
          templateUrl: 'partials/messageDialog.html',
          controller: 'DialogCtrl',
          resolve: {
            message: function () {
              return $sce.trustAsHtml(msg);
            },
          },
        })
        .result.then(function () {
          if (callback) {
            callback();
          }
        });
      return modalInstance.result;
    };

    dialogs.showListOfMsgs = function (messages) {
      var modalInstance = $uibModal.open({
        backdrop: 'static',
        animation: false,
        templateUrl: 'partials/messagesListDialog.html',
        controller: 'DialogCtrl',
        resolve: {
          message: function () {
            return messages;
          },
        },
      });
      return modalInstance.result;
    };

    dialogs.editTextField = function (scope) {
      var modalInstance = $uibModal
        .open({
          backdrop: 'static',
          animation: false,
          templateUrl: 'partials/textFieldDialog.html',
          size: 'lg',
          controller: 'DialogCtrl',
          resolve: {
            message: function () {
              return scope.ngModel;
            },
          },
        })
        .result.then(
          function (value) {
            // Use the value you passed from the $modalInstance.close() call
            scope.ngModel = value;
          },
          function (dismissed) {
            // Use the value you passed from the $modalInstance.dismiss() call
          }
        );
    };
    //template as param?
    //sizes: sm, md, lg
    //templates: enterValueDialog or enterTextValueDialog
    dialogs.enterValue = function (title, message, size, template, functionOnSuccess) {
      var modalInstance = $uibModal
        .open({
          backdrop: 'static',
          animation: false,
          templateUrl: 'partials/' + template + '.html',
          controller: 'ExtentedDialogCtrl',
          size: size,
          resolve: {
            message: function () {
              return message;
            },
            title: function () {
              return title;
            },
          },
        })
        .result.then(
          function (value) {
            // Use the value you passed from the $modalInstance.close() call
            functionOnSuccess(value);
            //scope.ngModel = value;
          },
          function (dismissed) {
            // Use the value you passed from the $modalInstance.dismiss() call
          }
        );
    };


    return dialogs;
  })


  .directive('autofocus', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, attr) {
        if (attr.autofocus == '' || $scope.$eval(attr.autofocus)) {
          $timeout(function () {
            function focusChild(el) {
              if (el) {
                if (el.hasChildNodes()) {
                  focusChild(el.children[0]);
                } else {
                  el.focus();
                }
              }
            }

            focusChild($element[0]);
          });
        }
      },
    };
  })

  .controller('ExtentedDialogCtrl', function ($scope, $uibModalInstance, message, title) {
    $scope.message = message;
    $scope.title = title;

    $scope.ok = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.saveTextField = function (newValue) {
      $uibModalInstance.close($scope.message);
      //.replace(/\r?\n|\r/g,"")
    };
  })

  .controller('DialogCtrl', function ($scope, $uibModalInstance, message) {
    $scope.message = message;

    $scope.ok = function (value) {
      $uibModalInstance.close(value);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.saveTextField = function (newValue) {
      $uibModalInstance.close($scope.message);
      //.replace(/\r?\n|\r/g,"")
    };
  })

  .service('genericErrorInterceptor', function ($q, $injector) {
    const service = this;

    service.response = function (response) {
      const Dialogs = $injector.get('Dialogs');

      const responsePayload = response?.data;
      if (responsePayload?.error) {
        Dialogs.showErrorMsg(responsePayload.error);
      }

      return response || $q.when(response);
    };

    service.responseError = function (response) {
      const Dialogs = $injector.get('Dialogs');
      const responsePayload = response?.data;
      if (response.status !== 200 && responsePayload?.errorMessage) {
        Dialogs.showErrorMsg(responsePayload.errorMessage);
      } else {
        // Legacy error handling
        if (response.status === 500) {
          if (responsePayload?.metaMessage?.includes('org.rtm.stream.UnknownStreamException')) {
            console.log('genericErrorInterceptor for rtm: ' + responsePayload.metaMessage);
          } else {
            Dialogs.showErrorMsg(responsePayload);
          }
        }
      }

      return $q.reject(response);
    };
  })
  .factory('httpRequestInterceptor', [
    'HttpInterceptorBridgeService',
    function (HttpInterceptorBridgeService) {
      return {
        request: function (request) {
          HttpInterceptorBridgeService.broadcast({
            type: 'REQUEST',
            request,
          });
          return request;
        },
        responseError: function (error) {
          HttpInterceptorBridgeService.broadcast({
            type: 'ERROR',
            error,
          });
          return Promise.reject(error);
        },
        response: function (response) {
          HttpInterceptorBridgeService.broadcast({
            type: 'RESPONSE',
            response,
          });
          return response;
        },
      };
    },
  ]);
//The following functions are missing in IE11

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    var subjectString = this.toString();
    if (
      typeof position !== 'number' ||
      !isFinite(position) ||
      Math.floor(position) !== position ||
      position > subjectString.length
    ) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    return this.substr(position || 0, searchString.length) === searchString;
  };
}
