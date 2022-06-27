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
  .module('parametersControllers', ['tables', 'step', 'screenConfigurationControllers'])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerView('parameters', 'partials/parameters/parameterList.html');
    EntityRegistry.registerEntity(
      'Parameter',
      'parameters',
      'parameters',
      'rest/parameters/',
      'rest/parameters/',
      'st-table',
      '/partials/parameters/parameterSelectionTable.html',
      null,
      'glyphicon glyphicon-list-alt'
    );
  })

  .controller(
    'editParameterCtrl',
    function ($scope, $uibModalInstance, $http, AuthService, id, ParameterScopeRenderer, ScreenTemplates) {
      $scope.AuthService = AuthService;

      $scope.scopeLabel = ParameterScopeRenderer.scopeLabel;
      $scope.scopeCssClass = ParameterScopeRenderer.scopeCssClass;
      $scope.scopeSpanCssClass = ParameterScopeRenderer.scopeSpanCssClass;
      $scope.scopeIcon = ParameterScopeRenderer.scopeIcon;

      $scope.selectScope = function (scope) {
        $scope.parameter.scopeEntity = '';
        $scope.parameter.scope = scope;
      };

      $scope.isApplicationScopeEnabled = false;
      ScreenTemplates.getScreenInputByScreenId('functionTable', 'attributes.application').then(function (input) {
        if (input) {
          $scope.isApplicationScopeEnabled = true;
        }
      });

      if (id == null) {
        $http.get('rest/parameters').then(function (response) {
          $scope.parameter = response.data;
        });
      } else {
        $http.get('rest/parameters/' + id).then(function (response) {
          $scope.parameter = response.data;
          if (!$scope.parameter.scope) {
            $scope.parameter.scope = ParameterScopeRenderer.normalizeScope($scope.parameter.scope);
          }
        });
      }

      $scope.save = function () {
        $http.post('rest/parameters', $scope.parameter).then(function (response) {
          $uibModalInstance.close();
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  )

  .directive('parameterKey', function () {
    return {
      restrict: 'E',
      scope: {
        parameter: '=',
        stOptions: '=?',
      },
      templateUrl: 'partials/parameters/parameterKey.html',
      controller: function ($scope, AuthService, ParameterDialogs) {
        $scope.authService = AuthService;
        $scope.noLink = $scope.stOptions && $scope.stOptions.includes('noEditorLink');
        $scope.editParameter = function (id) {
          ParameterDialogs.editParameter(id, function () {
            $scope.$emit('parameter.edited', $scope.parameter);
          });
        };
      },
    };
  })

  .directive('parameterScope', function () {
    return {
      restrict: 'E',
      scope: {
        parameter: '=',
      },
      template:
        '<span uib-tooltip="{{scopeLabel}}" ng-class="scopeSpanCssClass">' +
        '<i style="display:inline-block" ng-class="scopeIcon" class="glyphicon"></i> {{label}}</span>',
      controller: function ($scope, ParameterScopeRenderer) {
        $scope.scopeLabel = ParameterScopeRenderer.scopeLabel($scope.parameter.scope);
        $scope.scopeIcon = ParameterScopeRenderer.scopeIcon($scope.parameter.scope);
        $scope.scopeSpanCssClass = ParameterScopeRenderer.scopeSpanCssClass($scope.parameter.scope);
        $scope.label = ParameterScopeRenderer.label($scope.parameter);
      },
    };
  });
