/*******************************************************************************
 * Copyright (C) 2020, exense GmbH
 *
 * This file is part of STEP Enterprise
 *
 * STEP Enterprise can not be copied and/or distributed without the express permission of exense GmbH
 *******************************************************************************/
angular
  .module('functionPackages', ['step'])

  .controller('selectFunctionPackageModalCtrl', function ($scope, $uibModalInstance, $http, AuthService) {
    $scope.result = {};
    $scope.authService = AuthService;

    $scope.tableHandle = {};

    function reload() {
      $scope.tableHandle.reload();
    }

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.selectPackage = function (id) {
      $uibModalInstance.close(id);
    };
  })

  .factory('FunctionPackageTypeRegistry', function () {
    var registry = {};

    var api = {};

    api.register = function (typeName, label) {
      registry[typeName] = { label: label };
    };

    api.getLabel = function (typeName) {
      return registry[typeName] ? registry[typeName].label : 'Unknown';
    };

    api.getTypes = function () {
      return _.keys(registry);
    };

    return api;
  })

  .run(function (FunctionPackageTypeRegistry) {
    FunctionPackageTypeRegistry.register('java', 'Java Jar');
    FunctionPackageTypeRegistry.register('dotnet', '.NET DLL');
  })

  .run(function (FunctionTypeRegistry, ViewRegistry) {
    ViewRegistry.registerView('functionPackages', 'functionpackages/partials/functionPackageList.html');
    ViewRegistry.registerMenuEntry('Keyword packages', 'functionPackages', 'package', {weight: 20, parentId: "automation-root"});
  })


  .controller('FunctionPackageListCtrl', [
    '$scope',
    'stateStorage',
    function (
      $scope,
      $stateStorage,
    ) {
      $stateStorage.push($scope, 'functionPackages', {});
    },
  ])


//# sourceURL=functionPackages.js
