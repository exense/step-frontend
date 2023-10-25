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
  .module('plans', ['step', 'screenConfigurationControllers'])

  .factory('PlanTypeRegistry', function () {
    var api = {};

    var registry = {};

    api.register = function (type, label, editor) {
      registry[type] = {
        editor: editor,
        label: label,
        type: type,
      };
    };

    api.getEditorView = function (type) {
      return registry[type].editor;
    };

    api.getPlanTypes = function () {
      return _.values(registry);
    };

    api.getPlanType = function (typeName) {
      return registry[typeName];
    };

    return api;
  })

  .controller('PlansCtrl', ['$rootScope', '$scope', 'stateStorage', 'pathHelper', '$location',
    function ($rootScope, $scope, stateStorage, pathHelper, $location) {
    stateStorage.push($scope, 'plans', {});
    if ($scope.$state == null) {
       pathHelper.fixList();
    }

    $scope.$watch('$state', function () {
      if ($scope.$state != null) {
        $scope.selectView = $scope.$state;
      }
    });
  }]);
