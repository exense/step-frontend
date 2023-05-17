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
  .module('functionsControllers', ['step'])

  .run(function (FunctionTypeRegistry) {
    FunctionTypeRegistry.register(
      'step.plugins.functions.types.CompositeFunction',
      'Composite',
      null
    );
  })

  .controller('Composites', ['stateStorage', '$scope', function(stateStorage, $scope) {
    stateStorage.push($scope, 'composites', {});
  }])
  .controller('CompositeKeywordEditorCtrl', ['stateStorage', '$scope', function (stateStorage, $scope) {
    stateStorage.push($scope, 'editor', {});

    $scope.$watch('$state', function () {
      if ($scope.$state != null) {
        loadKeyword($scope.$state);
      }
    });

    function loadKeyword(id) {
      $scope.keywordId = id;
    }
  }])

  .factory('FunctionTypeRegistry', function () {
    var registry = {};

    var api = {};

    api.register = function (typeName, label, form) {
      registry[typeName] = { label: label, form: form };
    };

    api.getForm = function (typeName) {
      return registry[typeName].form;
    };

    api.getLabel = function (typeName) {
      return registry[typeName] ? registry[typeName].label : 'Unknown';
    };

    api.getTypes = function () {
      return _.keys(registry);
    };

    api.getFilteredTypes = function (arrayFilters) {
      var keys = _.keys(registry);
      var resultsArray = [];
      for (var i = 0; i < keys.length; i++) {
        if (arrayFilters.indexOf(keys[i]) >= 0) {
          resultsArray.push(keys[i]);
        }
      }
      return resultsArray;
    };

    return api;
  })

  .factory('FunctionDialogsConfig', function ($rootScope, $uibModal, $http, Dialogs, $location) {
    var functionDialogsConfig = {};

    functionDialogsConfig.getConfigObject = function (
      title,
      serviceRoot,
      functionTypeFilters,
      lightForm,
      customScreenTable
    ) {
      var config = {};
      config.title = title;
      config.serviceRoot = serviceRoot;
      config.functionTypeFilters = functionTypeFilters;
      config.lightForm = lightForm;
      config.customScreenTable = customScreenTable;
      return config;
    };

    functionDialogsConfig.getDefaultConfig = function () {
      return functionDialogsConfig.getConfigObject('Keyword', 'functions', [], false, 'functionTable');
    };

    return functionDialogsConfig;
  })

  .controller('newFunctionModalCtrl', [
    '$rootScope',
    '$scope',
    '$uibModalInstance',
    '$http',
    '$location',
    'function_',
    'dialogConfig',
    'Dialogs',
    'AuthService',
    'FunctionTypeRegistry',
    function (
      $rootScope,
      $scope,
      $uibModalInstance,
      $http,
      $location,
      function_,
      dialogConfig,
      Dialogs,
      AuthService,
      FunctionTypeRegistry
    ) {
      $scope.functionTypeRegistry = FunctionTypeRegistry;

      var newFunction = function_ == null;
      $scope.mode = newFunction ? 'add' : 'edit';
      $scope.dialogConfig = dialogConfig;
      $scope.isSchemaEnforced = AuthService.getConf().miscParams.enforceschemas;

      $scope.getTypes = function () {
        if ($scope.dialogConfig.functionTypeFilters != null && $scope.dialogConfig.functionTypeFilters.length > 0) {
          return $scope.functionTypeRegistry.getFilteredTypes($scope.dialogConfig.functionTypeFilters);
        } else {
          return $scope.functionTypeRegistry.getTypes();
        }
      };

      $scope.addRoutingCriteria = function () {
        $scope.criteria.push({ key: '', value: '' });
      };

      $scope.removeRoutingCriteria = function (key) {
        delete $scope.function_.tokenSelectionCriteria[key];
        loadTokenSelectionCriteria($scope.function_);
      };

      $scope.saveRoutingCriteria = function () {
        var tokenSelectionCriteria = {};
        _.each($scope.criteria, function (entry) {
          tokenSelectionCriteria[entry.key] = entry.value;
        });
        $scope.function_.tokenSelectionCriteria = tokenSelectionCriteria;
      };

      var loadTokenSelectionCriteria = function (function_) {
        $scope.criteria = [];
        if (function_ && function_.tokenSelectionCriteria) {
          _.mapObject(function_.tokenSelectionCriteria, function (val, key) {
            $scope.criteria.push({ key: key, value: val });
          });
        }
      };

      loadTokenSelectionCriteria(function_);

      $scope.loadInitialFunction = function () {
        $http
          .get('rest/' + $scope.dialogConfig.serviceRoot + '/types/' + $scope.function_.type)
          .then(function (response) {
            var initialFunction = response.data;
            if ($scope.function_) {
              initialFunction.id = $scope.function_.id;
              if ($scope.function_.attributes) {
                initialFunction.attributes = $scope.function_.attributes;
              }
              if ($scope.function_.schema) {
                initialFunction.schema = $scope.function_.schema;
              }
            }

            loadTokenSelectionCriteria(initialFunction);

            $scope.function_ = initialFunction;
            $scope.schemaStr = JSON.stringify($scope.function_.schema);
          });
      };

      if (newFunction) {
        if ($scope.dialogConfig.functionTypeFilters != null && $scope.dialogConfig.functionTypeFilters.length > 0) {
          $scope.function_ = { type: $scope.dialogConfig.functionTypeFilters[0] };
        } else {
          $scope.function_ = { type: 'step.plugins.java.GeneralScriptFunction' };
        }
        $scope.loadInitialFunction();
      } else {
        $scope.function_ = function_;
        $scope.schemaStr = JSON.stringify($scope.function_.schema);
      }

      $scope.save = function (editAfterSave) {
        var schemaJson;
        try {
          schemaJson = JSON.parse($scope.schemaStr);
          $scope.function_.schema = schemaJson;

          $http.post('rest/' + $scope.dialogConfig.serviceRoot + '', $scope.function_).then(function (response) {
            var function_ = response.data;
            $uibModalInstance.close(response.data);

            if (editAfterSave) {
              $http
                .get('rest/' + $scope.dialogConfig.serviceRoot + '/' + function_.id + '/editor')
                .then(function (response) {
                  var path = response.data;
                  if (path) {
                    $location.path(path);
                  } else {
                    Dialogs.showErrorMsg('No editor configured for this function type');
                  }
                });
            }
          });
        } catch (e) {
          Dialogs.showErrorMsg('incorrect schema format (must be Json) : ' + e);
        }
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    },
  ]);
