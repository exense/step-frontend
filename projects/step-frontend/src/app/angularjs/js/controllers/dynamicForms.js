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
var dynamicForms = angular.module('dynamicForms',['step','ngFileUpload'])

function initDynamicFormsCtrl($scope) {
  $scope.isDynamic = function() {
    if($scope.dynamicValue) {
      return $scope.dynamicValue.dynamic;
    } else {
      return false;
    }
  }
  $scope.useConstantValue = function() {
    $scope.dynamicValue.dynamic = false;
    $scope.dynamicValue.value = $scope.dynamicValue.expression;
    if ($scope.updateConstantValue) {
      $scope.updateConstantValue();
    }
    delete $scope.dynamicValue.expression;
    $scope.onSave();
  }
  
  $scope.useDynamicExpression = function() {
    $scope.dynamicValue.dynamic = true;
    $scope.dynamicValue.expression = $scope.dynamicValue.value;
    delete $scope.dynamicValue.value;
    $scope.onSave();
  }
  
  $scope.keydownUseDynamicExpression = function(event) {
    var x = event.which || event.keyCode;
    if (x === 32 || x === 13 ){ 
      $scope.useDynamicExpression();
    }
  }
  
  $scope.keydownUseConstantValue = function(event) {
    var x = event.which || event.keyCode;
    if (x === 32 || x === 13){ 
      $scope.useConstantValue();
    }
  }
} 

dynamicForms.directive('dynamicCheckbox', function() {
  return {
    restrict: 'E',
    scope: {
      dynamicValue: '=',
      label: '=',
      tooltip: '=',
      onSave: '&'
    },
    controller: function($scope) {
      initDynamicFormsCtrl($scope);
      $scope.updateConstantValue = function () {
        if ($scope.dynamicValue.value === "false") {
          $scope.dynamicValue.value = false;
        } else if ($scope.dynamicValue.value === "true") {
          $scope.dynamicValue.value = true;
        }
      }
    },
    templateUrl: 'partials/dynamicforms/checkbox.html'}
})
.directive('dynamicTextfield', function() {
  return {
    restrict: 'E',
    scope: {
      dynamicValue: '=',
      defaultValue: '=?',
      label: '=',
      tooltip: '=',
      onSave: '&'
    },
    controller: function($scope,Dialogs) {
      if ($scope.defaultValue && angular.isUndefined($scope.dynamicValue)) {
        $scope.dynamicValue = $scope.defaultValue
      }
      initDynamicFormsCtrl($scope);
      $scope.editConstantValue = function() {
        Dialogs.enterValue('Free text editor', $scope.dynamicValue.value, 'lg','enterTextValueDialog',function(value) {
          $scope.dynamicValue.value = value;
          $scope.onSave();
        });
      }
      
      $scope.editDynamicExpression = function() {
        Dialogs.enterValue('Free text editor', $scope.dynamicValue.expression, 'lg','enterTextValueDialog',function(value) {
          $scope.dynamicValue.expression = value;
          $scope.onSave();
        });
      }
      
      $scope.keydownEditConstantValue= function(event) {
        var x = event.which || event.keyCode;
        if (x === 32 || x === 13 ){ 
          $scope.editConstantValue();
        }
      }
      
      $scope.keydownEditDynamicExpression= function(event) {
          var x = event.which || event.keyCode;
          if (x === 32 || x === 13 ){ 
            $scope.editDynamicExpression();
          }
        }

    },
    templateUrl: 'partials/dynamicforms/textfield.html'}
})
.directive('dynamicJsonEditor', function() {
  return {
    restrict: 'E',
    scope: {
      dynamicValue: '=',
      label: '=',
      onSave: '&'
    },
    controller: function($scope) {
      initDynamicFormsCtrl($scope);
      $scope.save = function(json) {
        $scope.dynamicValue.value = json;
        $scope.onSave();
      }
    },
    templateUrl: 'partials/dynamicforms/jsonEditor.html'}
})
.directive('expressionInput', function() {
  return {
    controller: function() {
    },
    templateUrl: 'partials/dynamicforms/expressionInput.html'}
})
.controller('dynamicValueCtrl',function($scope) {
  initDynamicFormsCtrl($scope);
})
.directive('dynamicResourceInput', function() {
  return {
    restrict: 'E',
    scope: {
      dynamicValue: '=',
      label: '=',
      type: '=',
      tooltip: '=',
      onSave: '&'
    },
    controller: function($scope,$http,Upload,Dialogs,ResourceDialogs) {
      initDynamicFormsCtrl($scope);
    },
    templateUrl: 'partials/dynamicforms/dynamicResourceInput.html'}
})
