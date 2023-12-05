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
  .module('settingControllers', ['step'])

  .run(function (ViewRegistry) {
    ViewRegistry.registerView('settings', 'partials/settings.html');
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

  .controller('MyAccountCtrl', function ($scope) {
    $scope.$state = 'myaccount';
  });