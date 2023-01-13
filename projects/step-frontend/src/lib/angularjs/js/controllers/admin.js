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
angular
  .module('adminControllers', ['step'])

  .run(function (ViewRegistry, EntityRegistry, $timeout) {
    ViewRegistry.registerView('admin', 'partials/admin.html');
    ViewRegistry.registerView('settings', 'partials/settings.html');

    ViewRegistry.registerDashlet('admin', 'Users', 'partials/users/users.html', 'users');
    $timeout(function () {
      ViewRegistry.registerDashlet('admin', 'Settings', 'partials/adminSettings.html', 'controller');
    });
  })

  .controller('AdminCtrl', [
    '$rootScope',
    '$scope',
    'stateStorage',
    'ViewRegistry',
    'AuthService',
    function ($rootScope, $scope, stateStorage, ViewRegistry, AuthService) {
      // push this scope to the state stack
      stateStorage.push($scope, 'admin', {});

      $scope.tabs = [];

      function initTabs() {

        const hasAuth = AuthService.getConf().authentication;

        $scope.tabs = ViewRegistry.getDashlets('admin').filter((tab) => {
          if (tab.id === 'users' && !hasAuth) {
            return false;
          }
          return true;
        });

        $scope.canViewAdmin = AuthService.hasRight('admin-ui-menu');

        // Select the "Users" tab per default
        if ($scope.$state == null) {
          $scope.$state = hasAuth ? 'users' : $scope.tabs[0].id;
        }
      }

      if ($rootScope.isInitialized) {
        initTabs();
      } else {
        const unwatch = $rootScope.$watch('isInitialized', function(isInitialized){
          if (isInitialized) {
            initTabs();
            unwatch();
          }
        });
      }


      // Returns the item number of the active tab
      $scope.activeTab = function () {
        return _.findIndex($scope.tabs, function (tab) {
          return tab.id == $scope.$state;
        });
      };

      // Update the current $state and thus the browser location
      $scope.onSelection = function (tabid) {
        return ($scope.$state = tabid);
      };

      $scope.autorefresh = true;
    },
  ])

  .controller('ControllerSettingsCtrl', function ($scope, $http, stateStorage, ViewRegistry) {
    $scope.configurationItems = ViewRegistry.getDashlets('admin/controller');

    stateStorage.push($scope, 'controller', {});

    $scope.$watch('$state', function () {
      if ($scope.$state != null) {
        $scope.currentConfigurationItem = _.find($scope.configurationItems, function (item) {
          return item.id == $scope.$state;
        });
      }
    });

    $scope.currentConfigurationItem = $scope.configurationItems[0];

    $scope.setCurrentConfigurationItem = function (item) {
      $scope.$state = item.id;
      $scope.currentConfigurationItem = item;
    };
  })

  .controller('LightSettingsCtrl', function ($scope, $http, stateStorage, ViewRegistry) {
    $scope.configurationItems = ViewRegistry.getDashlets('settings');

    stateStorage.push($scope, 'settings', {});

    $scope.$watch('$state', function () {
      if ($scope.$state != null) {
        $scope.currentConfigurationItem = _.find($scope.configurationItems, function (item) {
          return item.id == $scope.$state;
        });
      }
    });

    $scope.currentConfigurationItem = $scope.configurationItems[0];

    $scope.setCurrentConfigurationItem = function (item) {
      $scope.$state = item.id;
      $scope.currentConfigurationItem = item;
    };
  })

  .controller('editUserModalCtrl', function ($scope, $uibModalInstance, $http, $location, AuthService, user) {
    $scope.roles = AuthService.getConf().roles;
    $scope.user = user;
    $scope.new = $scope.user.username ? false : true;

    if (!user.role) {
      user.role = $scope.roles[0];
    }

    $scope.save = function () {
      $http.post('rest/admin/user', user).then(function () {
        $uibModalInstance.close('save');
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.close('cancel');
    };
  })

  .controller('resetPasswordModalCtrl', function ($scope, $uibModalInstance, $http, $location, AuthService, user) {
    $scope.user = user;
    $http.post('rest/admin/user/' + user.username + '/resetpwd').then(function (response) {
      $scope.password = response.data.password;
    });

    $scope.close = function () {
      $uibModalInstance.close();
    };
  })

  .controller('MyAccountCtrl', function ($scope, $rootScope, $interval, $http, helpers, $uibModal, AuthService) {
    $scope.$state = 'myaccount';

    $scope.token = '';

    $scope.showGenerateApiKeyDialog = function () {
      var modalInstance = $uibModal.open({
        backdrop: 'static',
        animation: false,
        templateUrl: 'partials/generateApiKey.html',
        controller: 'GenerateApiKeyModalCtrl',
      });
      return modalInstance.result;
    };
  })

  .controller('GenerateApiKeyModalCtrl', function ($scope, $rootScope, $uibModalInstance, $http) {
    $scope.token = '';

    $scope.generateToken = function () {
      const days = $scope.lifetime ? $scope.lifetime : 0;
      $http.get('rest/access/service-account/token?lifetime=' + days).then(function (response) {
        $scope.token = response.data;
      });
    };

    $scope.copyToken = function () {
      navigator.clipboard.writeText($scope.token).then(function () {
        $scope.copied = true;
        $scope.$apply();
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.close();
    };
  });
