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
  .module('components', ['step'])

  .directive('statusDistribution', function () {
    return {
      restrict: 'E',
      scope: {
        progress: '=',
      },
      templateUrl: 'partials/components/statusSummary.html',
      controller: function ($scope, $http) {},
    };
  })

  .directive('executionLink', function () {
    return {
      restrict: 'E',
      scope: {
        executionId: '=',
        executionDescription: '=',
      },
      templateUrl: 'partials/components/executionLink.html',
      controller: function ($scope, $http) {
        $scope.$watch('executionId', function () {
          if ($scope.executionId && !$scope.executionDescription) {
            $http.get('rest/executions/' + $scope.executionId).then(function (response) {
              var data = response.data;
              $scope.executionDescription = data.description;
            });
          }
        });
      },
    };
  })

  .directive('date', function () {
    return {
      restrict: 'E',
      scope: {
        time: '=',
      },
      template: "<span>{{ time | date:'dd.MM.yyyy HH:mm:ss'}}</span>",
      controller: function () {},
    };
  })

  .directive('datems', function () {
    return {
      restrict: 'E',
      scope: {
        time: '=',
      },
      template: "<span>{{ time | date:'dd.MM.yyyy HH:mm:ss.sss'}}</span>",
      controller: function () {},
    };
  })

  .directive('time', function () {
    return {
      restrict: 'E',
      scope: {
        time: '=',
      },
      template: "<span>{{ time | date:'HH:mm:ss'}}</span>",
      controller: function () {},
    };
  })

  .service('ngCopy', [
    '$window',
    function ($window) {
      var body = angular.element($window.document.body);
      var textarea = angular.element('<textarea/>');
      textarea.css({
        position: 'fixed',
        opacity: '0',
      });

      return function (toCopy) {
        textarea.val(toCopy);
        body.append(textarea);
        textarea[0].select();

        try {
          var successful = document.execCommand('copy');
          if (!successful) throw successful;
        } catch (err) {
          //window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
        }

        textarea.remove();
      };
    },
  ])


  .directive('stTextPopup', function (Dialogs) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
      },
      link: function (scope, element, attr) {
        element.on('dblclick', function (event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          modalResult = Dialogs.editTextField(scope);
        });
      },
      controller: function ($scope) {},
    };
  })

  .directive('resourceLabel', function () {
    return {
      restrict: 'E',
      scope: {
        stModel: '=',
        stFormat: '@?',
      },
      controller: function ($scope, $http) {
        $scope.resourceFilename = '';
        $scope.$watch('stModel', function (newValue) {
          if (newValue) {
            if ($scope.isResource()) {
              $http.get('rest/resources/' + $scope.getResourceId()).then(function (response) {
                var resource = response.data;
                if (resource) {
                  $scope.resourceNotExisting = false;
                  $scope.resourceFilename = resource.resourceName;
                } else {
                  $scope.resourceNotExisting = true;
                }
              });
            } else {
              $scope.absoluteFilepath = $scope.stModel;
              $scope.fileName = $scope.absoluteFilepath.replace(/^.*[\\\/]/, '');
            }
          }
        });

        $scope.isResource = function () {
          return $scope.stModel && typeof $scope.stModel == 'string' && $scope.stModel.indexOf('resource:') == 0;
        };
        $scope.getResourceId = function () {
          return $scope.stModel.replace('resource:', '');
        };
      },
      templateUrl: 'partials/components/resourceLabel.html',
    };
  })

  .directive('executionResult', function () {
    return {
      restrict: 'E',
      scope: {
        execution: '=',
      },
      templateUrl: 'partials/components/executionResult.html',
      controller: function ($scope) {
        $scope.iconClass = function () {
          var css = '';
          if ($scope.execution) {
            css += 'glyphicon';
            if ($scope.execution.status != 'ENDED') {
              css += ' glyphicon-refresh icon-refresh-animate smaller';
            } else {
              if ($scope.execution.result == 'PASSED') {
                css += ' glyphicon-ok-sign';
              } else {
                css += ' glyphicon-exclamation-sign';
              }
            }
          }
          return css;
        };
        $scope.result = function () {
          if ($scope.execution) {
            if ($scope.execution.status != 'ENDED') {
              return $scope.execution.status;
            } else {
              if ($scope.execution.result) {
                return $scope.execution.result;
              } else {
                // backward compatibility with executions run before 3.9
                return 'UNKNOW';
              }
            }
          } else {
            return '';
          }
        };
      },
    };
  })

  .directive('multiLineInput', function () {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element, attrs) {
        // workaround for IE as IE only pastes the first line
        if (window.clipboardData) {
          element.bind('paste', function (e) {
            var clipped = window.clipboardData.getData('Text');
            clipped = clipped.replace(/(\r\n|\n|\r)/gm, ' ');
            $(this).val(clipped);
            return false;
          });
        }
      },
    };
  })

  .directive('dateinput', [
    '$http',
    function ($http) {
      return {
        restrict: 'E',
        scope: { action: '=' },
        link: function (scope, element, attr, tabsCtrl) {
          scope.onEnter = function (event) {
            var inputValue = element.find('input').val();
            scope.action(inputValue);
          };
        },
        controller: function ($scope) {
          $scope.maxDate = new Date();
          $scope.open = false;
        },
        templateUrl: 'partials/datepicker.html',
      };
    },
  ])

  .directive('inputdropdown', [
    '$http',
    function ($http) {
      return {
        restrict: 'E',
        scope: { options: '=', action: '=', initialValue: '=', handle: '=', onlyOptions: '=?' },
        controller: function ($scope) {
          $scope.model = {};
          $scope.model.inputtext = $scope.initialValue ? $scope.initialValue : '';
          $scope.onlyOptions = $scope.onlyOptions ? $scope.onlyOptions : false;
          if ($scope.model.inputtext !== '') {
            $scope.action($scope.model.inputtext);
          }

          $scope.createRegexpForSelection = function (selection) {
            regexp = '';
            if (selection.length > 1) {
              regexp = '(';
              _.each(selection, function (value) {
                regexp += value.text + '|';
              });
              regexp = regexp.slice(0, -1) + ')';
            } else if (selection.length == 1) {
              regexp = selection[0].text;
            }
            return regexp;
          };

          if ($scope.handle) {
            $scope.handle.set = function (value) {
              $scope.model.inputtext = value;
              $scope.action($scope.model.inputtext);
            };
          }

          $scope.$watchCollection('options', function (newOptions, oldOptions) {
            _.each(newOptions, function (option) {
              var oldOption = _.findWhere($scope.options, { text: option.text });
              if (oldOption) {
                option.selected = oldOption.selected;
              }
            });
            $scope.options = newOptions;
          });
          //      $scope.handle.updateOptions = function(options) {
          //        if($scope.options) {
          //          _.each(options,function(option) {
          //            var currentOption = _.findWhere($scope.options, {text: option.text});
          //            if(currentOption) {
          //              option.selected = currentOption.selected;
          //            }
          //          })
          //        }
          //        $scope.options = options;
          //      }

          $scope.selectionChanged = function () {
            var selection = _.where($scope.options, { selected: true });
            if (selection.length == 0 && $scope.onlyOptions) {
              selection = _.where($scope.options, { selected: false });
            }
            $scope.model.inputtext = $scope.createRegexpForSelection(selection);
            $scope.action($scope.model.inputtext);
          };
        },
        templateUrl: 'partials/inputdropdown.html',
      };
    },
  ]);
