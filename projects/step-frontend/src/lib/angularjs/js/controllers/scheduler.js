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
  .module('schedulerControllers', [])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerView('scheduler', 'partials/scheduler.html');
    ViewRegistry.registerDashlet(
      'admin/controller',
      'Scheduler',
      'partials/scheduler/schedulerConfiguration.html',
      'scheduler'
    );
    ViewRegistry.registerDashlet(
      'settings',
      'Scheduler',
      'partials/scheduler/schedulerConfiguration.html',
      'scheduler'
    );
  })


  .controller('SchedulerConfigurationCtrl', function ($scope, $http, AuthService) {
    $scope.authService = AuthService;
    $scope.model = {};

    $http.get('rest/settings/scheduler_enabled').then(function (response) {
      $scope.model.schedulerEnabledToggle = response.data ? response.data == 'true' : false;
    });

    $http.get('rest/settings/scheduler_execution_username').then(function (response) {
      $scope.executionUser = response.data ? response.data : '';
    });

    $scope.toggleSchedulerEnabled = function () {
      $scope.model.schedulerEnabledToggle = !$scope.model.schedulerEnabledToggle;
      $http.put('rest/scheduler/task/schedule?enabled=' + $scope.model.schedulerEnabledToggle.toString());
    };

    $scope.save = function () {
      $http.post('rest/settings/scheduler_execution_username', $scope.executionUser);
    };
  });
