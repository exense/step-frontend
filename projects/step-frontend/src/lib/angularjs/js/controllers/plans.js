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
  .module('plans', ['tables', 'step', 'screenConfigurationControllers'])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerView('plans', 'partials/plans/plans.html');
  })

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

  .controller('PlansCtrl', ['$rootScope', '$scope', 'stateStorage', 'pathHelper',
    function ($rootScope, $scope, stateStorage, pathHelper) {
    stateStorage.push($scope, 'plans', {});
    if ($scope.$state == null) {
       $scope.$state = 'list';
       pathHelper.fixList();
    }

    $scope.$watch('$state', function () {
      if ($scope.$state != null) {
        $scope.selectView = $scope.$state;
      }
    });
  }])

  .controller(
    'createPlanCtrl', [
      '$scope', '$uibModalInstance', '$location', '$http', 'AuthService', 'planTypeRegistryService',
    function ($scope, $uibModalInstance, $location, $http, AuthService, planTypeRegistryService) {
      $scope.AuthService = AuthService;

      $scope.template = 'TestCase';
      $scope.plan = { attributes: {} };

      $scope.planTypes = planTypeRegistryService.getItemInfos();
      $scope.planType = $scope.planTypes.find(function (planType){
        return planType.type === 'step.core.plans.Plan';
      });

      $http.get('rest/plans/artefact/templates').then(function (response) {
        $scope.artefactTypes = response.data;
      });

      $scope.save = function (editAfterSave) {
        $http.get('rest/plans?type=' + $scope.planType.type + '&template=' + $scope.template).then(function (response) {
          var createdPlan = response.data;
          createdPlan.attributes = $scope.plan.attributes;
          if (createdPlan.root) {
            createdPlan.root.attributes = createdPlan.attributes;
          }
          $http.post('rest/plans', createdPlan).then(function (response) {
            $uibModalInstance.close(response.data);
            if (editAfterSave) {
              $location.path('/root/plans/editor/' + createdPlan.id);
            }
          });
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  ])

  .directive('planLink', function () {
    return {
      restrict: 'E',
      scope: {
        entityRef: '=?',
        entityId: '=?',
        entityTenant: '=?',
        description: '=?',
        linkOnly: '=?',
        stOptions: '=?',
        continueOnCancel: '=?',
      },
      templateUrl: 'partials/components/planLink.html',
      controller: function ($scope, LinkProcessor, $location, Dialogs) {
        $scope.noLink = $scope.stOptions && $scope.stOptions.includes('noEditorLink');
        if ($scope.entityRef && $scope.entityRef.repositoryID === 'local') {
          $scope.entityId = $scope.entityRef.repositoryParameters.planid;
        }
        $scope.openLink = () => {
          LinkProcessor.process($scope.entityTenant)
            .then(
              () => {
                $location.path('/root/plans/editor/' + $scope.entityId);
                $scope.$apply();
              },
              () => {
                if ($scope.continueOnCancel) {
                  $location.path('/root/plans/editor/' + $scope.entityId);
                  $scope.$apply();
                }
              }
            )
            .catch((errorMessage) => {
              if (errorMessage) {
                Dialogs.showErrorMsg(errorMessage);
              }
            });
        };
      },
    };
  })

  .directive('planLinkAndName', function () {
    return {
      restrict: 'E',
      scope: {
        planRef: '=?',
      },
      templateUrl: 'partials/components/planLinkAndName.html',
      controller: function ($scope, $http) {
        $scope.noLink = $scope.stOptions && $scope.stOptions.includes('noEditorLink');
        if ($scope.planRef && $scope.planRef.repositoryID == 'local') {
          $scope.planId = $scope.planRef.repositoryParameters.planid;
          $http.get('rest/plans/' + $scope.planId).then(function (response) {
            $scope.planName = response.data.attributes.name;
          });
        }
      },
    };
  })

  .directive('planName', function () {
    return {
      restrict: 'E',
      scope: {
        planRef: '=?',
      },
      templateUrl: 'partials/components/planName.html',
      controller: function ($scope, $http) {
        if ($scope.planRef && $scope.planRef.repositoryID == 'local') {
          $scope.planId = $scope.planRef.repositoryParameters.planid;
          $http.get('rest/plans/' + $scope.planId).then(function (response) {
            $scope.planName = response.data.attributes.name;
          });
        }
      },
    };
  });
