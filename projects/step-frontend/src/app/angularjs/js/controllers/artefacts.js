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
angular.module('artefacts',['step'])

.run(function(ViewRegistry, EntityRegistry) {
  EntityRegistry.registerEntity('Control', 'artefact', 'artefacts', null, null, 'st-table', '/partials/artefacts/artefactSelectionTable.html');
})

.factory('artefactTypes', function() {
  
  var registry = {};
  
  var api = {};
  
  function getType(typeName) {
    if(registry[typeName]) {
      return registry[typeName];
    } else {
      throw "Unknown artefact type "+typeName;
    }
  }
  
  function typeExist(typeName) {
    return registry[typeName] != null;
  }
  
  api.register = function(typeName,typeInfo) {
    if(!typeInfo.label) {
      typeInfo.label = typeName;
    }
    if(!('isSelectable' in typeInfo)) {
      typeInfo.isSelectable = true;
    }
    registry[typeName] = typeInfo;
  }
  
  api.getEditor = function(typeName) {
    return getType(typeName).form;
  }

  api.getDefaultIcon = function(typeName) {
    return 'glyphicon-unchecked';
  }
  
  api.getIcon = function(typeName) {
    return getType(typeName).icon;
  }

  api.getDescription = function(typeName) {
    return getType(typeName).description;
  }
  
  api.getLabel = function(typeName) {
    return getType(typeName).label;
  }
  
  api.getTypes = function() {
    return _.keys(registry);
  }
  
  api.isSelectable = function(typeName) {
    return typeExist(typeName) && getType(typeName).isSelectable;
  }
  
  return api;
})

.run(function(artefactTypes) {
  artefactTypes.register('TestSet',{icon:'glyphicon-folder-close', form:'partials/artefacts/testSet.html',
    description:'Used to group up TestCase’s as a single unit and executing them in parallel'});
  artefactTypes.register('TestCase',{icon:'glyphicon-list-alt', form:'partials/artefacts/testCase.html', 
	  description:'Specific container for a group of nodes, it will activate the top-level panel in the execution view for high-level test case execution monitoring'});
  artefactTypes.register('TestScenario',{icon:'glyphicon-equalizer', form:'partials/artefacts/testScenario.html', 
	  description:'Usually used to parallelize the execution of multiple ThreadGroups or ‘sub’ plans'});
  artefactTypes.register('CallPlan',{icon:'glyphicon-new-window', form:'partials/artefacts/callPlan.html', 
	  description:'Used to invoke a plan from within another plan'});
  artefactTypes.register('CallKeyword',{icon:'glyphicon-record', form:'partials/artefacts/callFunction.html', 
	  description:'Technical node used as part of keyword invocation. Can be used explicitly in order to call a keyword by reflection'});
  artefactTypes.register('For',{icon:'glyphicon-th', form:'partials/artefacts/for.html', 
	  description:'Creates a For loop at execution time and iterates through its children'});
  artefactTypes.register('ForEach',{icon:'glyphicon-th', form:'partials/artefacts/forEach.html', 
	  description:'Creates a ForEach loop based on a collection and iterates through the child nodes'});
  artefactTypes.register('While',{icon:'glyphicon-repeat', form:'partials/artefacts/while.html', 
	  description:'Iterates over the node content until the given condition is not met'});
  artefactTypes.register('DataSet',{icon:'glyphicon-th-large', form:'partials/artefacts/dataSet.html', 
	  description:'Used to iterate over rows of data in a table'});
  artefactTypes.register('Synchronized',{icon:'glyphicon-align-justify', form:'partials/artefacts/synchronized.html', 
	  description:'Guarantee thread safety within a test block by synchronizing all threads on the entire Test Execution'});
  artefactTypes.register('Sequence',{icon:'glyphicon-align-justify', form:'partials/artefacts/sequence.html', 
	  description:'Guarantees the ordering of the child nodes, as displayed in the tree.'});
  artefactTypes.register('BeforeSequence',{icon:'glyphicon-arrow-up', form:'partials/artefacts/sequence.html', description:''});
  artefactTypes.register('AfterSequence',{icon:'glyphicon-arrow-down', form:'partials/artefacts/sequence.html', 
	  description:''});
  artefactTypes.register('Return',{icon:'glyphicon-share-alt', form:'partials/artefacts/return.html', 
	  description:'Used within a Composite Keyword, set the Composite output to the returned value(s)'});
  artefactTypes.register('Echo',{icon:'glyphicon-zoom-in', form:'partials/artefacts/echo.html', 
	  description:'Used to print data in the report nodes of a plan, mostly for debugging or information purposes'});
  artefactTypes.register('If',{icon:'glyphicon-unchecked', form:'partials/artefacts/if.html', 
	  description:'Only executes the child nodes if the condition is met'});
  artefactTypes.register('Session',{icon:'glyphicon-magnet', form:'partials/artefacts/functionGroup.html', 
	  description:'Guarantees that Keywords are executed within the the same Session i.e. Agent Token'});
  artefactTypes.register('Set',{icon:'glyphicon-save', form:'partials/artefacts/set.html', 
	  description:'Sets a value to a variable, which can then be accessed throughout Plans and sub Plans'});
  artefactTypes.register('Sleep',{icon:'glyphicon-hourglass', form:'partials/artefacts/sleep.html', 
	  description:'Causes the thread to sleep'});
  artefactTypes.register('Script',{icon:'glyphicon-align-left', form:'partials/artefacts/script.html', 
	  description:'Executes any arbitrary groovy code. The script context is local, which means that variable used in the script control cannot be accessed externally by other nodes'});
  artefactTypes.register('ThreadGroup',{icon:'glyphicon-resize-horizontal', form:'partials/artefacts/threadGroup.html', 
	  description:'Starts multiple threads which will execute the node content in parallel'});
  artefactTypes.register('BeforeThread',{icon:'glyphicon-arrow-left', form:'partials/artefacts/sequence.html'
	  ,description:''});
  artefactTypes.register('AfterThread',{icon:'glyphicon-arrow-right', form:'partials/artefacts/sequence.html', 
	  description:''});
  artefactTypes.register('Thread',{icon:'glyphicon-resize-horizontal', form:'partials/artefacts/threadGroup.html', isSelectable:false});
  artefactTypes.register('Switch',{icon:'glyphicon-option-vertical', form:'partials/artefacts/switch.html', 
	  description:'Same as in any programming language, to use in combinaison with the "Case" control'});
  artefactTypes.register('Case',{icon:'glyphicon-minus', form:'partials/artefacts/case.html', 
	  description:'Same as in any programming language, to use in combinaison with the "Switch" control'});
  artefactTypes.register('RetryIfFails',{icon:'glyphicon-retweet', form:'partials/artefacts/retryIfFails.html', 
	  description:'Retry mechanism with grace period'});
  artefactTypes.register('Check',{icon:'glyphicon-ok', form:'partials/artefacts/check.html', 
	  description:'Performs a custom assertion using groovy expressions. Useful for validating the output of the parent node. For standard assertions use the Control Assert instead'});
  artefactTypes.register('Assert',{icon:'glyphicon-ok', form:'partials/artefacts/assert.html', 
	  description:'Validates the output of a keyword execution.'});
  artefactTypes.register('Placeholder',{icon:'glyphicon-unchecked', form:'partials/artefacts/placeholder.html', 
	  description:''});
  artefactTypes.register('Export',{icon:'glyphicon-export', form:'partials/artefacts/export.html', 
	  description:''});
})

.directive('artefactDetails', function($http,$timeout,$interval,stateStorage,$filter,$location) {
  return {
    restrict: 'E',
    scope: {
      artefact: '=',
      onSave: '&',
      readonly: '=',
      handle: '='
    },
    controller: function($scope,$location,artefactTypes,AuthService) {
      
      $scope.authService = AuthService;
      $scope.showAttributes = true;
      $scope.$watch('artefact', function() {
        if($scope.artefact) {
          var classname = $scope.artefact._class;
          $scope.icon = artefactTypes.getIcon(classname);
          $scope.label = artefactTypes.getLabel(classname);
          $scope.editor = artefactTypes.getEditor(classname);
          $scope.description = artefactTypes.getDescription(classname);
        }
      })

      $scope.save = function() {
        if(!$scope.readonly) {
          if($scope.onSave) {
            $scope.onSave({artefact:$scope.artefact});
          }
        }
      }
    },
    templateUrl: 'partials/artefacts/abstractArtefact.html'}
})
.controller('CallPlanCtrl' , function($scope,$location,$http, PlanDialogs) {  
  $scope.gotoPlan = function() {
    $location.path('/root/plans/editor/' + $scope.artefact.planId);
  }
  
  $scope.$watch('artefact.planId', function(planId) {
    if(planId) {
      $http.get('rest/plans/'+planId).then(function(response) {
    	if (response.data) {
            $scope.planName = response.data.attributes.name;
    	} else {
    		$scope.planName = "";
    	}
      })
    }
  })
  
  $scope.selectPlan = function() {
    PlanDialogs.selectPlan(function(plan) {
      $scope.artefact.planId = plan.id;
      $scope.artefact.attributes.name = plan.attributes.name;
      $scope.save();
    })
  }
})
.controller('CallFunctionCtrl' , function($scope,$uibModal,$location,$http,FunctionDialogs, Dialogs) {
  
  showTokenSelectionParameters = false;
  
  $scope.ready=false;
  
  function loadFunction(id, callback) {
    $http({url:"rest/functions/"+id,method:"GET"}).then(function(response) {
      $scope.targetFunction = response.data;
      $scope.ready = true;
      if(callback) {
        callback();
      }
    })
  }
  
  $scope.$watch('artefact.functionId', function(id) {
    $scope.ready = false;
    if(id!=null) {
      loadFunction(id);  
    } else {
      $scope.targetFunction = {};
      $scope.ready = true;
    }
  })
  
  $scope.gotoFunction = function() {
    FunctionDialogs.editFunction($scope.targetFunction.id);
  }
  
  $scope.openFunctionEditor = function(functionid) {
    FunctionDialogs.openFunctionEditor($scope.targetFunction.id);
  }
  
  $scope.setArgument = function(json) {
    $scope.artefact.argument = json;
    $scope.save();
  }
  
  $scope.selectFunction = function() {
    Dialogs.selectEntityOfType('functions', true).then(function(result) {
      var id = result.item;
      $scope.artefact.functionId = id;
      loadFunction(id, function() {$scope.save()});
    });
  }
  
})
.controller('DataSourceCtrl' , function($scope,$uibModal,$location,$http,FunctionDialogs) {  
  $scope.dataSourceTypes = [{name:"excel",label:"Excel"},{name:"csv",label:"CSV"},{name:"sql",label:"SQL"},
                            {name:"file",label:"Flat file"},{name:"folder",label:"Directory"},{name:"sequence",label:"Integer sequence"},
                            {name:"json-array",label:"Json array"}, {name:"json",label:"Json String (Legacy)"}, {name:"gsheet",label:"Google Sheet v4"}]
  
  $scope.loadInitialDataSourceConfiguration = function() {
    $http.get("rest/datapool/types/"+$scope.artefact.dataSourceType).then(function(response){
      $scope.artefact.dataSource = response.data;
      $scope.save();
    })
  }
})
.controller('DefaultArtefactFormCtrl' , function($scope) {
  $scope.getEditableArtefactProperties = function() {
    return _.without(_.keys($scope.artefact),'id','_id','root','attributes','childrenIDs','createSkeleton','_class','attachments')
  }
})
.controller('AssertCtrl' , function($scope,$uibModal,$location,$http,FunctionDialogs) {  
  $scope.operatorTypes = [{name:"EQUALS",label:"equals"},{name:"BEGINS_WITH",label:"begins with"},{name:"CONTAINS",label:"contains"},
                            {name:"ENDS_WITH",label:"ends with"},{name:"MATCHES",label:"matches"}]
  

})
.directive('customJsonEditor', function($http,$timeout,$interval,stateStorage,$filter,$location,$compile,Dialogs) {
  return {
    restrict: 'E',
    scope: {
      argsValue: '=',
      compileHtml: "=",
      onSave: '&'
    },
    controller: function($scope,$location,$rootScope, AuthService) {
      $scope.inputs = {};
      
      $scope.getFunctionInputs = function(validateJson) {
        try {
          $scope.inputs = JSON.parse($scope.argsValue);
          return true;
        }
        catch(err) {
          if(validateJson) {
            Dialogs.showErrorMsg("Invalid JSON: " + err)            
          }
          return false;
        }
      }
      
      $scope.save = function() {
        $scope.argsValue = JSON.stringify($scope.inputs);
        $timeout(function() {
          $scope.onSave({argsValue:$scope.argsValue});
        });
        
      }
      
    },
    link: function ($scope, element, attrs) {
      $scope.$watch('compileHtml', function(newCompileHtml) {
        if (newCompileHtml) {
          var template = $compile('<div id="customTemplate">' + $scope.compileHtml + '</div>')($scope);
          var el = $('#customTemplate');
          if (el.length) {
            el.replaceWith(template);
          } else {
            element.append(template);
          }
        }
      });
      
      $scope.$watch('argsValue', function(newArgs,oldArgs) {
        if (newArgs) {
          $scope.getFunctionInputs(false);
        }
      });
    }
  }
})

.directive('jsonEditor', function($http,$timeout,$interval,stateStorage,$filter,$location,Dialogs) {
  return {
    restrict: 'E',
    scope: {
      model: '=',
      onChange: '&'
    },
    templateUrl: 'partials/jsonEditor.html',
    controller: function($scope,$location,$rootScope, AuthService) {
      $scope.localModel = {json:""}
      $scope.argumentAsTable = [];
      $scope.isFocusOnLastRow=false;
      $scope.doCommitLastRow=false;
      $scope.stillEditing=false;
      
      $scope.$watch('model', function(json) {
        if(json!=$scope.localModel.json) {
          $scope.localModel.json = json;
          $scope.updateEditors(false);
          initLastRow();
        }
      })

      $scope.$watch('doCommitLastRow', function(value) {
        if(value === true) { 
          $timeout(function() {
          $scope.commitLastRow();
            $scope.doCommitLastRow=false;
          });
        }
      })
      
      $scope.$watch('stillEditing', function(value) {
        if(value === true) { 
          $timeout(function() {
            $scope.stillEditing=false;
          });
        }
      })
      
      $scope.save = function() {
        $scope.onChange({json:$scope.localModel.json});
      }
      
      $scope.updateJsonFromTable = function() {
        var json = {};
        _.each($scope.argumentAsTable, function(entry) {
          json[entry.key]=entry.value;
        })
        $scope.localModel.json = JSON.stringify(json);
      }
      
      $scope.containsKeyInTable = function(newKey) {
        var result=false;
        _.each($scope.argumentAsTable, function(entry) {
          if (newKey === entry.key) {
            result = true;;
          }
        })
        return result;
      }
      
      $scope.addRowToTable = function(row) {
        $scope.argumentAsTable.push(row)
        $scope.updateJsonFromTable();
        $scope.save();
      }
      
      $scope.removeRowFromTable = function(key) {
        $scope.argumentAsTable = _.reject($scope.argumentAsTable, function(entry){ return entry.key==key});
        $scope.updateJsonFromTable();
        $scope.save();
      }
      
      $scope.onRowEdit = function() {
        $scope.updateJsonFromTable();
        $scope.save();
      }
      
      $scope.onJsonFieldBlur = function() {
        if($scope.updateEditors(true)) {
          $scope.save();
        }
      }
      
      $scope.updateEditors = function(validateJson) {
        try {
          $scope.argumentAsTable = _.map(JSON.parse($scope.localModel.json), function(val, key) {
            if(_.isObject(val) && _.has(val,'dynamic')) {
              return {"key":key,"value":val};              
            } else {
              // support the static json format without dynamic expressions
              return {"key":key,"value":{"value":val,dynamic:false}};              
            }
          });
          return true;
        }
        catch(err) {
          if(validateJson) {
            Dialogs.showErrorMsg("Invalid JSON: " + err)            
          }
          return false;
        }
      }
      
      function initLastRow() {
        // init last row as a static value
        $scope.stillEditing=true;
        $scope.lastRow = {key:"", value:{value:"",dynamic:false}}  
        var inputElt = document.getElementById("lastRowKey");
        if (inputElt !== null) {
          inputElt.style.backgroundColor = "white";
        }
      }

      $scope.commitLastRow = function() {
        if ( $scope.lastRow !==  undefined && $scope.lastRow.key !== undefined) {
          //avoid duplicates
          if (!$scope.containsKeyInTable($scope.lastRow.key)) {
            var row = $scope.lastRow;
            $scope.addRowToTable({"key":row.key, "value":row.value});
            initLastRow();
            $scope.isFocusOnLastRow=true;
          } else  {
            if ($scope.lastRow.key !== "") {
               Dialogs.showErrorMsg("The key must be unique!");
            }
            document.getElementById("lastRowKey").style.backgroundColor = "#faebd7";
          }          
        }
      }
      
      $scope.onBlurFromLastRowKey = function() {
        //only save on the last key blur events if key is set 
        if ($scope.lastRow.key !== "") {
          $scope.saveLastRow();
        }
      }
      
      $scope.saveLastRow = function() {
        if ($scope.stillEditing) {
        } else {
             $scope.doCommitLastRow=true;
        }
      }
      
      $scope.lastRowTabKeyToValue = function(event) {
        var x = event.which || event.keyCode;
        if (x === 9 && !event.shiftKey) {
          $scope.stillEditing=true;
        }
      }
      
      $scope.lastRowTabValueToKey = function(event) {
        var x = event.which || event.keyCode;
        if (x === 9 && (event.shiftKey || 
                event.target.attributes['title'] === undefined || 
                event.target.attributes['title'].nodeValue!=='Use a dynamic expression to set this attribute')) {
          $scope.stillEditing=true;
        }
      }
      
      $scope.onClickOnLastRow = function () {
        $scope.stillEditing=true;
      }
      
      
    },
    link: function($scope, element, attrs) {

      $scope.$watch('isFocusOnLastRow', function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].querySelector('#lastRowKey').focus();
            $scope.isFocusOnLastRow=false;
          });
        }
      })
    }
  }
})
.controller('ArtefactSelectionCtrl' , function($scope, $http, artefactTypes) {
  $http.get("rest/plans/artefact/types").then(function(response){
    $scope.artefacts = _.filter(_.map(response.data, function(e) {return {name:e}}), function(artefact) {
      return artefactTypes.isSelectable(artefact.name)
    });
  })
  $scope.artefactIcon = function(class_) { 
    return 'glyphicon '+artefactTypes.getIcon(class_)
  };

  $scope.artefactDescription = function(class_) {
      return artefactTypes.getDescription(class_)
    };
})
