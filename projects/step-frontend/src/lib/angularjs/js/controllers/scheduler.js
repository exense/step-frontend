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

  .controller('newTaskModalCtrl', function ($scope, $uibModalInstance, executionParams) {
    $scope.name = executionParams.description;

    $scope.ok = function () {
      var taskParams = {
        name: $scope.name,
        cronExpression: $scope.cron,
        executionsParameters: executionParams,
        attributes: { name: $scope.name },
      };
      $uibModalInstance.close(taskParams);
    };

    $scope.applyPreset = function (preset) {
      $scope.cron = preset;
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  })

  .controller('editSchedulerTaskModalCtrl', function ($scope, $uibModalInstance, $http, $location, task, PlanDialogsService) {
    $scope.task = task;

    //Init customParameters if it doesn't exist yet
    if (!$scope.task.executionsParameters.customParameters) {
      $scope.task.executionsParameters.customParameters = {};
    }
    $scope.executionsParameters = function (value) {
      if (arguments.length) {
        $scope.task.executionsParameters = JSON.parse(value);
        return value;
      } else {
        return JSON.stringify($scope.task.executionsParameters);
      }
    };

    $scope.save = function () {
      $http.post('rest/scheduler/task', $scope.task).then(
        function (response) {
          $uibModalInstance.close(response.data);
        },
        function (error) {
          $scope.error = 'Invalid CRON expression or server error.';
        }
      );
    };

    $scope.applyPreset = function (preset) {
      $scope.task.cronExpression = preset;
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.selectPlan = function () {
      PlanDialogsService.selectPlan().subscribe(function (plan) {
        $scope.task.executionsParameters.repositoryObject.repositoryParameters.planid = plan.id;
        $scope.task.executionsParameters.description = plan.attributes.name;
        if (!$scope.task.attributes) {
          $scope.task.attributes = {};
        }
        //Do not overwrite task name, $scope.task.attributes.name = plan.attributes.name;
      });
    };
  })

    .factory('schedulerServices', function ($http, $location, $uibModal) {
    var factory = {};

    factory.schedule = function (executionParams) {
      var modalInstance = $uibModal.open({
        backdrop: 'static',
        templateUrl: 'partials/scheduler/newSchedulerTaskDialog.html',
        controller: 'newTaskModalCtrl',
        resolve: {
          executionParams: function () {
            return executionParams;
          },
        },
      });

      modalInstance.result.then(
        function (taskParams) {
          $http.post('rest/scheduler/task', taskParams).then(function () {
            $location.path('/root/scheduler/');
          });
        },
        function () {}
      );
    };

    return factory;
  });
