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
    ViewRegistry.registerMenuEntry('Resources', 'resources', 'book',  {weight: 50, parentId: "automation-root"});
  })

  .controller('editResourceCtrl', function ($scope, $uibModalInstance, $http, AuthService, Upload, id) {
    function loadResource(id) {
      $http.get('rest/resources/' + id).then(function (response) {
        $scope.resource = response.data;
      });
    }

    if (id == null) {
      $scope.resource = {};
      $scope.mode = 'new';
      $scope.newResource = { id: '', resourceType: 'attachment' };
    } else {
      $scope.mode = 'edit';
      loadResource(id);
    }

    $scope.uploading = false;

    $scope.upload = function (file) {
      if (file) {
        $scope.uploading = true;
        Upload.upload({
          url: 'rest/resources/' + $scope.resource.id + '/content',
          data: { file: file },
        }).then(
          function (resp) {
            // Reload resource to get the updated resourceName
            loadResource(id);
            $scope.uploading = false;
          },
          function (resp) {
            console.log('Error status: ' + resp.status);
            $scope.uploading = false;
          },
          function (evt) {
            $scope.progress = parseInt((100.0 * evt.loaded) / evt.total);
          }
        );
      }
    };

    $scope.openFileChooser = function () {
      $('#fileInput').click();
    };

    $scope.save = function () {
      $http.post('rest/resources', $scope.resource).then(function (response) {
        $uibModalInstance.close();
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.applyResourceType = function (type) {
      $scope.newResource.resourceType = type;
    };

    $scope.newResourceUpdate = function () {
      if ($scope.newResource.id) {
        $scope.mode = 'edit';
        loadResource($scope.newResource.id.replace('resource:', ''));
      }
    };
  })


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
