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
  .module('resourcesControllers', ['tables', 'step'])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerView('resources', 'partials/resources/resourceList.html');
    ViewRegistry.registerMenuEntry('Resources', 'resources', 'book', { weight: 50, parentId: 'automation-root' });
  })

  .controller(
    'fileAlreadyExistsWarningCtrl',
    function ($scope, $uibModalInstance, $http, AuthService, similarResources) {
      $scope.similarResources = similarResources;

      $scope.selectResource = function (id) {
        $uibModalInstance.close(id);
      };

      $scope.createNewResource = function () {
        $uibModalInstance.close(null);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  )

  .controller('updateResourceWarningCtrl', function ($scope, $uibModalInstance, $http, AuthService, resource) {
    $scope.resource = resource;

    $scope.updateResource = function () {
      $uibModalInstance.close(true);
    };

    $scope.createNewResource = function () {
      $uibModalInstance.close(false);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
