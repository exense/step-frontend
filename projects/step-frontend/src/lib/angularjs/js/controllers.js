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
var initTestDashboard = false;

var tecAdminControllers = angular.module('tecAdminControllers', [
  'components',
  'chart.js',
  'step',
  'views',
  'ui.bootstrap',
  'reportTree',
  'reportTable',
  'schedulerControllers',
  'viz-dashboard-manager',
]);

tecAdminControllers.run(function (ViewRegistry, EntityRegistry, AuthService) {
  ViewRegistry.registerDashletAdvanced(
    'executionTab',
    'Execution steps',
    'partials/execution/executionStep.html',
    'steps',
    0,
    function () {
      return true;
    }
  );
  ViewRegistry.registerDashletAdvanced(
    'executionTab',
    'Execution tree',
    'partials/execution/executionTree.html',
    'tree',
    1,
    function () {
      return true;
    }
  );

  ViewRegistry.registerDashletAdvanced(
    'executionTab',
    'Performance',
    'partials/execution/executionViz.html',
    'viz',
    2,
    function () {
      return true;
    }
  );
  ViewRegistry.registerDashletAdvanced(
    'executionTab',
    'Errors',
    'partials/execution/executionError.html',
    'errors',
    3,
    function () {
      return true;
    }
  );
});

function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

tecAdminControllers.factory('executionServices', function ($http, $q, $filter, ScreenTemplates) {
  var factory = {};

  factory.getDefaultExecutionParameters = function () {
    return $q(function (resolve, reject) {
      ScreenTemplates.getScreenInputsByScreenId('executionParameters').then(function (inputs) {
        var result = {};
        _.each(inputs, function (input) {
          if (input.defaultValue) {
            result[input.id] = input.defaultValue;
          } else {
            if (input.options && input.options.length > 0) {
              result[input.id] = input.options[0].value;
            } else {
              result[input.id] = '';
            }
          }
        });
        resolve(result);
      });
    });
  };

  return factory;
});

tecAdminControllers.directive('executionCommands', [
  '$rootScope',
  '$http',
  '$location',
  'stateStorage',
  '$uibModal',
  '$timeout',
  'AuthService',
  'schedulerServices',
  'executionServices',
  'ngCopy',
  function (
    $rootScope,
    $http,
    $location,
    $stateStorage,
    $uibModal,
    $timeout,
    AuthService,
    schedulerServices,
    executionServices,
    ngCopy
  ) {
    return {
      restrict: 'E',
      scope: {
        artefact: '&',
        isolateExecution: '=?',
        description: '=',
        includedTestcases: '&',
        onExecute: '&',
        execution: '=',
      },
      templateUrl: 'partials/executionCommands.html',
      link: function ($scope, $element, $attr, $tabsCtrl) {
        $scope.model = {};

        $scope.authService = AuthService;
        if ($scope.execution) {
          $scope.executionParameters = _.clone($scope.execution.executionParameters.customParameters);
        } else {
          $scope.executionParameters = {};
          executionServices.getDefaultExecutionParameters().then(function (defaultParameters) {
            $scope.executionParameters = defaultParameters;
          });
        }
        $scope.isolateExecution = $scope.isolateExecution
          ? $scope.isolateExecution
          : $scope.execution
          ? $scope.execution.executionParameters.isolatedExecution
          : false;

        function buildExecutionParams(simulate) {
          var executionParams = { userID: $rootScope.context.userID };
          executionParams.description = $scope.description;
          executionParams.mode = simulate ? 'SIMULATION' : 'RUN';
          executionParams.repositoryObject = $scope.artefact();
          executionParams.exports = [];
          executionParams.isolatedExecution = $scope.isolateExecution;
          var includedTestcases = $scope.includedTestcases();
          if (includedTestcases) {
            if (includedTestcases.by == 'id') {
              executionParams.artefactFilter = {
                class: 'step.artefacts.filters.TestCaseIdFilter',
                includedIds: includedTestcases.list,
              };
            } else if (includedTestcases.by == 'name') {
              executionParams.artefactFilter = {
                class: 'step.artefacts.filters.TestCaseFilter',
                includedNames: includedTestcases.list,
              };
            } else {
              throw 'Unsupported clause ' + includedTestcases.by;
            }
          }
          executionParams.customParameters = $scope.executionParameters;
          return executionParams;
        }

        $scope.copyExecutionServiceAsCurlToClipboard = function () {
          var location = window.location;
          var url =
            location.protocol +
            '//' +
            location.hostname +
            (location.port ? ':' + location.port : '') +
            '/rest/executions/start';
          var payload = buildExecutionParams(false);
          var cmd = 'curl -X POST ' + url + " -H 'Content-Type: application/json' -d '" + JSON.stringify(payload) + "'";
          ngCopy(cmd);
        };

        $scope.execute = function (simulate) {
          var executionParams = buildExecutionParams(simulate);

          $http.post('rest/executions/start', executionParams).then(function (response) {
            var eId = response.data;

            $location.$$search = {};
            $location.path('/root/executions/' + eId);

            $timeout(function () {
              $scope.onExecute();
            });
          });
        };
        $scope.stop = function () {
          $http.get('rest/executions/' + $scope.execution.id + '/stop');
        };

        $scope.schedule = function () {
          var executionParams = buildExecutionParams(false);
          schedulerServices.schedule(executionParams);
        };
      },
    };
  },
]);

tecAdminControllers.directive('executionProgress', [
  '$http',
  '$timeout',
  '$interval',
  'stateStorage',
  '$filter',
  '$location',
  'viewFactory',
  '$window',
  'reportTableFactory',
  'ViewRegistry',
  'executionsPanelsService',
  'selectionCollectorFactoryService',
  function (
    $http,
    $timeout,
    $interval,
    $stateStorage,
    $filter,
    $location,
    viewFactory,
    $window,
    reportTableFactory,
    ViewRegistry,
    executionsPanelsService,
    selectionCollectorFactoryService
  ) {
    return {
      restrict: 'E',
      scope: {
        eid: '=',
        updateTabTitle: '&titleUpdate',
        closeTab: '&closeTab',
        active: '&active',
      },
      controller: function ($scope, $location, $anchorScroll, $compile, $element) {
        var eId = $scope.eid;
        $stateStorage.push($scope, eId, {});
        executionsPanelsService.initialize();

        const testCasesSelection = selectionCollectorFactoryService.create('artefactID');
        $scope.$on('$destroy', () => testCasesSelection.destroy());
        $scope.testCasesSelection = testCasesSelection;
        $scope.determineDefaultSelection = () => {
          if (!$scope.testCases || !$scope.execution) {
            return;
          }

          const selectedTestCases = $scope.testCases.filter(value => $scope.testCaseTableDefaultSelection(value));
          testCasesSelection.select(...selectedTestCases);
        }

        $scope.tabs = ViewRegistry.getDashlets('executionTab');
        $scope.tabs = _.filter($scope.tabs, function (dash) {
          return dash.isEnabledFct();
        });

        if ($scope.$stateExec) {
        } else {
          $scope.$stateExec = 'steps';
        }

        // Returns the item number of the active tab
        $scope.activeTab = function () {
          let idx = _.findIndex($scope.tabs, function (tab) {
            return tab.id == $scope.$stateExec;
          });
          return idx;
        };

        //steps and tree tabs are linked (handle to jump from steps to tree declared in report node directive need to be known in steps)
        $scope.includeTab = function (entry) {
          return (
            entry.id == $scope.$stateExec ||
            (entry.id == 'steps' && $scope.$stateExec == 'tree') ||
            (entry.id == 'tree') & ($scope.$stateExec == 'steps')
          );
        };

        $scope.onSelection = function (tabid) {
          return ($scope.$stateExec = tabid);
        };

        $scope.panels = executionsPanelsService.panels;
        $scope.customPanels = executionsPanelsService.customPanels;

        $scope.scrollTo = function (viewId) {
          executionsPanelsService.setShowPanel(viewId, true, eId);
          $location.hash($scope.getPanelId(viewId));
          $anchorScroll();
        };

        $scope.isShowPanel = function (viewId) {
          return executionsPanelsService.isShowPanel(viewId, eId);
        };
        $scope.setShowPanel = function (viewId, show) {
          executionsPanelsService.setShowPanel(viewId, show, eId);
        };
        $scope.isPanelEnabled = function (viewId) {
          return executionsPanelsService.isPanelEnabled(viewId, eId);
        };
        $scope.toggleShowPanel = function (viewId) {
          executionsPanelsService.toggleShowPanel(viewId, eId);
        };
        $scope.enablePanel = function (viewId, enabled) {
          executionsPanelsService.enablePanel(viewId, enabled, eId);
        };
        $scope.getPanelId = function (viewId) {
          return eId + viewId;
        };
        $scope.getPanelTitle = function (viewId) {
          return executionsPanelsService.getPanelTitle(viewId, eId);
        };

        $scope.drillDownTestcase = function (id) {
          testCasesSelection.clear();
          testCasesSelection.selectById(id);

          $scope.enablePanel('steps', true);
          $scope.scrollTo('steps');
        };
        $scope.testCaseTableDefaultSelection = function (value) {
          var execution = $scope.execution;
          if (execution) {
            var artefactFilter = execution.executionParameters.artefactFilter;
            if (artefactFilter) {
              if (artefactFilter.class == 'step.artefacts.filters.TestCaseFilter') {
                return _.contains(artefactFilter.includedNames, value.name);
              } else if (artefactFilter.class == 'step.artefacts.filters.TestCaseIdFilter') {
                return _.contains(artefactFilter.includedIds, value.artefactID);
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        };

        $scope.operationOptions = { showAll: false };

        $scope.executionViewServices = {
          showNodeInTree: function (nodeId) {
            $http.get('/rest/controller/reportnode/' + nodeId + '/path').then(function (response) {
              $scope.$stateExec = 'tree';
              var path = response.data;
              path.shift();
              $scope.reportTreeHandle.expandPath(path);
            });
          },
          showTestCase: function (nodeId) {
            $http.get('/rest/controller/reportnode/' + nodeId + '/path').then(function (response) {
              var path = response.data;
              _.each(path, function (node) {
                if (node.resolvedArtefact && node.resolvedArtefact._class === 'TestCase') {
                  testCasesSelection.clear();
                  testCasesSelection.selectById(node.resolvedArtefact.id);
                  $scope.enablePanel('testCases', true);
                  $scope.setShowPanel('testCases', true);
                }
              });
              $scope.$stateExec = 'steps';
              $scope.scrollTo('testCases');
            });
          },
          getExecution: function () {
            return $scope.execution;
          },
        };

        $scope.getIncludedTestcases = function () {
          var table = $scope.testCaseTable;
          var selectionMode = (table && table.getSelectionMode) ? table.getSelectionMode() : 'all';
          if (selectionMode == 'all' || table.areAllSelected()) {
            return null;
          } else if (selectionMode == 'custom' || selectionMode == 'none') {
            var includedTestCases = {
              by: $scope.execution.executionParameters.repositoryObject.repositoryID == 'local' ? 'id' : 'name',
            };
            var result = [];
            if (table.getRows != null) {
              _.each(table.getRows(true), function (value) {
                result.push(includedTestCases.by == 'id' ? value.artefactID : value.name);
              });
            }
            includedTestCases.list = result;
            return includedTestCases;
          } else {
            throw 'Unsupported selection mode: ' + selectionMode;
          }
        };

        $scope.onTestExecutionStarted = function () {
          $scope.closeTab();
        };

        $scope.reportTreeHandle = {};
      },
      link: function ($scope, $element, $rootscope) {
        var eId = $scope.eid;
        $scope.reloadingTable = false;
        $scope.isRefreshing = false;
        /*$http.get('rest/rtm/rtmlink/' + eId).then(function(response) {
				$scope.rtmlink = response.data.link;
			})*/

        var refreshTestCaseTable = function () {
          $http
            .get('rest/executions/' + eId + '/reportnodes?limit=500&class=step.artefacts.reports.TestCaseReportNode')
            .then(function (response) {
              var data = response.data;
              if (data.length > 0) {
                if (data.length > 1 && !$scope.isPanelEnabled('testCases')) {
                  $scope.setShowPanel('steps', false);
                  $scope.setShowPanel('testCases', true);
                }
                $scope.enablePanel('testCases', true);
              }
              $scope.testCases = data;
              $scope.determineDefaultSelection();
            });
        };

        $scope.showTestCaseCurrentOperation = true;
        var refreshExecution = function () {
          $http.get('rest/executions/' + eId).then(function (response) {
            var data = response.data;
            $scope.execution = data;
            $scope.determineDefaultSelection();
            var showTestCaseCurrentOperation = $scope.execution.parameters.find(
              (o) => o.key === 'step.executionView.testcases.current-operations'
            );
            if (showTestCaseCurrentOperation) {
              if (showTestCaseCurrentOperation.value.toLowerCase() === 'true') {
                $scope.showTestCaseCurrentOperation = true;
              } else {
                $scope.showTestCaseCurrentOperation = false;
              }
            }
            // Set actual execution to the tab title
            $scope.updateTabTitle()(eId, data);
          });
        };

        $scope.throughputchart = {};
        $scope.responseTimeByFunctionChart = {};

        var refresh = function () {
          $http.get('rest/views/statusDistributionForFunctionCalls/' + eId).then(function (response) {
            $scope.progress = response.data;
          });

          $http.get('rest/views/statusDistributionForTestcases/' + eId).then(function (response) {
            $scope.testcasesProgress = response.data;
          });

          $http.get('rest/views/errorDistribution/' + eId).then(function (response) {
            $scope.errorDistribution = response.data;
            $scope.countByErrorMsg = [];
            $scope.countByErrorCode = [];
            _.map($scope.errorDistribution.countByErrorMsg, function (val, key) {
              var r = /\\\\u([\d\w]{4})/gi;
              key = key.replace(r, function (match, grp) {
                return String.fromCharCode(parseInt(grp, 16));
              });
              key = decodeURIComponent(key);
              $scope.countByErrorMsg.push({ errorMessage: key, errorCount: val });
            });
            _.map($scope.errorDistribution.countByErrorCode, function (val, key) {
              $scope.countByErrorCode.push({ errorCode: key, errorCodeCount: val });
            });
          });

          $scope.errorDistributionToggleStates = ['message', 'code'];
          $scope.selectedErrorDistirbutionToggle = 'message';

          $scope.stepColumnHandle = {};
          $scope.searchStepByError = function (error) {
            $scope.$stateExec = 'steps';
            $scope.stepColumnHandle.set(escapeRegExp(error));
          };

          if ($scope.stepsTable && $scope.stepsTable.reload) {
            $scope.stepsTable.reload();
          }

          viewFactory.getReportNodeStatisticCharts(eId).then(function (charts) {
            $scope.throughputchart = charts.throughputchart;
            $scope.responseTimeByFunctionChart = charts.responseTimeByFunctionChart;
            $scope.performancechart = charts.performancechart;
          });

          viewFactory.getTimeBasedChart('ErrorRate', eId, 'Errors/s').then(function (chart) {
            $scope.errorratechart = chart;
          });

          $http.get('rest/threadmanager/operations?eid=' + eId).then(function (response) {
            $scope.currentOperations = response.data;
          });

          if ($scope.reportTreeHandle.refresh) {
            $scope.reportTreeHandle.refresh();
          }
        };

        $scope.refresh = refresh;

        function refreshAll() {
          refreshExecution();
          refresh();
          refreshTestCaseTable();
        }

        refreshAll();

        var refreshFct = function () {
          if ($scope.autorefresh.enabled) {
            refreshExecution();
            if ($scope.execution == null || $scope.execution.status != 'ENDED') {
              if ($scope.active()) {
                refresh();
                refreshTestCaseTable();
              }
            } else {
              $scope.autorefresh.enabled = false;
              refresh();
              refreshTestCaseTable();
            }
          }
        };

        $scope.initAutoRefresh = function (on, interval, autoIncreaseTo) {
          $scope.autorefresh.enabled = on;
          $scope.autorefresh.interval = interval;
          $scope.autorefresh.refreshFct = refreshFct;
          $scope.autorefresh.autoIncreaseTo = autoIncreaseTo;
        };
        $scope.autorefresh = {};

        $scope.$watch('execution.status', function (newStatus, oldStatus) {
          if (newStatus) {
            if (newStatus === 'ENDED') {
              refreshFct(); //perform final refresh
              $scope.initAutoRefresh(false, 0, 0);
            } else {
              if (oldStatus == null) {
                $scope.initAutoRefresh(true, 100, 5000);
              }
            }
          }
        });

      },
      templateUrl: 'partials/execution/progress.html',
    };
  },
]);

tecAdminControllers.controller('ExecutionTabsCtrl', [
  '$scope',
  '$http',
  'stateStorage',
  'pathHelper',
  function ($scope, $http, $stateStorag, pathHelper) {
    $stateStorag.push($scope, 'executions', { tabs: [{ id: 'list', title: 'Execution list', type: 'list' }] });
    if ($scope.$state == null) {
      $scope.$state = 'list';
      pathHelper.fixList();
    }

    $scope.isTabActive = function (id) {
      return id == $scope.$state;
    };

    $scope.tabs = $stateStorag.get($scope).tabs;

    $scope.newTab = function (eid, title) {
      $scope.tabs = [...$scope.tabs, { id: eid, title: title, active: false, type: 'progress' }];
      $stateStorag.store($scope, { tabs: $scope.tabs });
      $scope.selectTab(eid);
    };

    $scope.selectTab = function (eid) {
      $scope.$state = eid;
      $(document).ready(function () {
        $scope.$broadcast('resize-widget');
        $scope.$broadcast('resize-timeline');
      });
    };

    $scope.updateTabTitle = function (eid, execution) {
      var tab = _.findWhere($scope.tabs, { id: eid });
      tab.title = execution.description;
      tab.execution = execution;
    };

    $scope.getTabExecution = function (eid) {
      return _.findWhere($scope.tabs, { id: eid }).execution;
    };

    $scope.closeTab = function (eid) {
      $scope.tabs = $scope.tabs.filter(tab => tab.id !== eid);

      if ($scope.$state == eid) {
        $scope.$state = $scope.tabs[$scope.tabs.length - 1].id;
      }
      $stateStorag.store($scope, { tabs: $scope.tabs });

      $(document).ready(function () {
        $scope.$broadcast('resize-widget');
        $scope.$broadcast('resize-timeline');
      });
    };

    $scope.$watch('$state', function () {
      if ($scope.$state != null && _.findWhere($scope.tabs, { id: $scope.$state }) == null) {
        $scope.newTab($scope.$state, '');
      }
    });
  },
]);

tecAdminControllers.directive('autoRefreshCommands', [
  '$rootScope',
  '$http',
  '$location',
  'stateStorage',
  '$uibModal',
  '$timeout',
  '$interval',
  function ($rootScope, $http, $location, $stateStorage, $uibModal, $timeout, $interval) {
    return {
      restrict: 'E',
      scope: {
        autorefresh: '=',
        stInline: '=?',
      },
      templateUrl: 'partials/autoRefreshPopover.html',
      controller: function ($scope) {
        $scope.autoRefreshPresets = [
          { label: 'OFF', value: 0, disabled: false },
          { label: '5 seconds', value: 5000, disabled: false },
          { label: '10 seconds', value: 10000, disabled: false },
          { label: '30 seconds', value: 30000, disabled: false },
          { label: '1 minute', value: 60000, disabled: false },
          { label: '5 minutes', value: 300000, disabled: false },
        ];

        var manuallyChanged = false;

        $scope.autorefresh.setMinPresets = function (minValue) {
          for (var i = 0; i < $scope.autoRefreshPresets.length; i++) {
            var obj = $scope.autoRefreshPresets[i];
            if (obj.value > 0 && obj.value < minValue) {
              obj.disabled = false; //for now keep it active
            } else {
              obj.disabled = false;
            }
          }
        };

        $scope.changeRefreshInterval = function (newInterval) {
          manuallyChanged = true;
          $scope.autorefresh.interval = newInterval;
          if ($scope.autorefresh.interval > 0) {
            $scope.autorefresh.enabled = true;
          } else {
            $scope.autorefresh.enabled = false;
          }
        };

        $scope.closePopOver = function () {
          $scope.popOverIsOpen = false;
        };

        var refreshTimer;

        $scope.startTimer = function () {
          if (angular.isDefined(refreshTimer)) {
            return;
          }

          if ($scope.autorefresh.enabled && $scope.autorefresh.interval > 0) {
            refreshTimer = $interval(function () {
              $scope.autorefresh.refreshFct();
              if (
                $scope.autorefresh.autoIncreaseTo &&
                !manuallyChanged &&
                $scope.autorefresh.interval < $scope.autorefresh.autoIncreaseTo
              ) {
                var newInterval = $scope.autorefresh.interval * 2;
                $scope.autorefresh.interval =
                  newInterval < $scope.autorefresh.autoIncreaseTo ? newInterval : $scope.autorefresh.autoIncreaseTo;
              }
              //reset flag;
              manuallyChanged = false;
            }, $scope.autorefresh.interval);
          }
        };

        $scope.stopTimer = function () {
          if (angular.isDefined(refreshTimer)) {
            $interval.cancel(refreshTimer);
            refreshTimer = undefined;
          }
        };

        $scope.$watch('autorefresh.interval', function (newInterval, oldInterval) {
          if (oldInterval != newInterval || !angular.isDefined(refreshTimer)) {
            $scope.stopTimer();
            $rootScope.$broadcast('globalsettings-refreshInterval', { new: $scope.autorefresh.interval });
            $scope.startTimer();
          }
        });

        $scope.$watch('autorefresh.enabled', function (newStatus, oldStatus) {
          if (angular.isDefined(newStatus) && newStatus != oldStatus) {
            if (newStatus) {
              //refresh as soon as autorefresh is re-activated
              $scope.autorefresh.refreshFct();
            } else {
              //In case autorefresh is stopped by parent, we must set interval to 0 explicitly
              $scope.autorefresh.interval = 0;
            }

            $rootScope.$broadcast('globalsettings-globalRefreshToggle', { new: newStatus });
          }
        });

        $scope.$on('$destroy', function () {
          if (angular.isDefined(refreshTimer)) {
            $interval.cancel(refreshTimer);
          }
        });
      },
    };
  },
]);

tecAdminControllers.directive('executionViz', [
  '$rootScope',
  '$http',
  '$location',
  '$window',
  'stateStorage',
  '$uibModal',
  '$timeout',
  'AuthService',
  'schedulerServices',
  'executionServices',
  'ngCopy',
  function (
    $rootScope,
    $http,
    $location,
    $window,
    $stateStorage,
    $uibModal,
    $timeout,
    AuthService,
    schedulerServices,
    executionServices,
    ngCopy
  ) {
    return {
      restrict: 'E',
      scope: {
        eid: '=',
        autorefresh: '=',
        execution: '=',
      },
      templateUrl: 'partials/execution/executionVizD.html',
      controller: function ($scope, $window) {
        $scope.openLink = function (link, target) {
          $window.open(link, target);
        };
      },
      link: function ($scope, $element, $attr, $tabsCtrl) {
        var eId = $scope.eid;
        $scope.displaymode = 'managed';
        $scope.topmargin = $element[0].parentNode.parentNode.getBoundingClientRect().top * 2;

        $scope.dashboardsendpoint = [];

        // default buttons
        $scope.measurementtypemodel = 'keyword';
        $scope.timeframe = '30s';

        $(document).ready(function () {
          $scope.topmargin = $element[0].parentNode.parentNode.getBoundingClientRect().top * 2;
          $(document).ready(function () {
            $scope.$broadcast('resize-widget');
          });
        });

        $scope.$on('dashboard-ready', function () {
          if (!$scope.init) {
            $scope.init = true;
          }
        });

        $scope.vizRelated = { lockdisplay: false };
        $scope.unwatchlock = $scope.$watch('vizRelated.lockdisplay', function (newvalue) {
          if ($scope.displaymode === 'readonly') {
            $scope.displaymode = 'managed';
          } else {
            if ($scope.displaymode === 'managed') {
              $scope.displaymode = 'readonly';
            }
          }
        });

        $scope.setTimeframe = function (timeframe) {
          if (timeframe === 'max') {
            $scope.$broadcast('apply-global-setting', { key: '__from__', value: '0', isDynamic: false });
            $scope.$broadcast('apply-global-setting', { key: '__to__', value: '4078304655000', isDynamic: false });

            $scope.$broadcast('reload-scales', { xAxis: '' });
          } else {
            // currently applying an offset of 10% to take in account the query execution time and make sure to visually "frame" the data
            // this a temporary workaround to the fact that new Date() is called at different times for the scale & query input
            var offset = Math.round(timeframe * 0.08);
            var adjustedFrom = timeframe * 1 + offset;

            var effectiveFrom = 'new Date().getTime() - ' + timeframe;
            var axisFrom = 'new Date().getTime() - ' + adjustedFrom;

            var effectiveTo = 'new Date().getTime()';
            var axisTo = 'new Date().getTime() - ' + offset;

            $scope.$broadcast('apply-global-setting', { key: '__from__', value: effectiveFrom, isDynamic: true });
            $scope.$broadcast('apply-global-setting', { key: '__to__', value: effectiveTo, isDynamic: true });

            $scope.$broadcast('reload-scales', { xAxis: '[' + axisFrom + ', ' + axisTo + ']' });
          }
        };

        $scope.initTimelineWidget = function () {
          // Timeline widget
          $scope.globalsettingsPh = [
            new Placeholder('__businessobjectid__', eId, false),
            new Placeholder('__measurementType__', 'keyword', false),
          ];

          $scope.timelinewidget = new TimelineWidget($scope);
          //
        };

        $scope.setMeasurementType = function (input) {
          $scope.measurementtypemodel = input;
          $scope.$broadcast('apply-global-setting', { key: '__measurementType__', value: input, isDynamic: false });
        };

        $scope.switchToPermanent = function () {
          $scope.isRealTime = '';
          $scope.dashboardsendpoint = [
            new PerformanceDashboard($scope.eid, $scope.measurementtypemodel, $scope.measurementtypemodel),
          ];
          $scope.initTimelineWidget();
        };

        $scope.switchToRealtime = function () {
          $scope.isRealTime = 'Realtime';
          $scope.dashboardsendpoint = [
            new RealtimePerformanceDashboard(
              $scope.eid,
              $scope.measurementtypemodel,
              $scope.measurementtypemodel,
              false
            ),
          ];
        };

        $scope.init = false;

        $scope.$watch('execution.status', function (newStatus, oldStatus) {
          if (newStatus) {
            $scope.init = false;
            if (newStatus === 'ENDED') {
              $scope.switchToPermanent();
            } else {
              $scope.switchToRealtime();
            }
          }
        });

        $scope.$watch('autorefresh.enabled', function (newValue, oldStatus) {
          if ($scope.init) {
            if (newValue) {
              if ($scope.execution.status !== 'ENDED') {
                $scope.switchToRealtime();
              }
            } else {
              //already ended
              if ($scope.execution.status !== 'ENDED') {
                $scope.switchToPermanent();
              }
            }
          }
        });

        $scope.oldIntervalValue = -1;
        $scope.initFct = function () {
          if ($scope.execution.status !== 'ENDED') {
            $scope.switchToRealtime();
            //change refresh interval to min 10 seconds (will use an auto increase) and start viz refreh
            $scope.oldIntervalValue = $scope.autorefresh.interval;
            $scope.oldAutoIncreaseTo = $scope.autorefresh.autoIncreaseTo;
            var minValue = 10000;
            $scope.autorefresh.setMinPresets(minValue);
            if ($scope.oldIntervalValue <= minValue) {
              $scope.autorefresh.interval = 1000; // trigger the watcher to restart the timer
              $scope.autorefresh.autoIncreaseTo = minValue;
            }
            $timeout(function () {
              $scope.$broadcast('globalsettings-globalRefreshToggle', { new: $scope.autorefresh.enabled });
            });
          } else {
            $scope.switchToPermanent();
          }
        };
        $scope.initFct();

        $scope.cleanup = function () {
          //turning off refresh when clicking other views
          $scope.$broadcast('globalsettings-refreshToggle', { new: false });
          //reverting to previous interval (if changed on preformance tab)
          //when opening the execution autorefresh is not defined yet
          if ($scope.autorefresh && $scope.autorefresh.setMinPresets) {
            $scope.autorefresh.setMinPresets(0);
          }
          if ($scope.oldIntervalValue >= 0) {
            $scope.autorefresh.interval = $scope.oldIntervalValue;
            $scope.autorefresh.autoIncreaseTo = $scope.oldAutoIncreaseTo;
            $scope.oldIntervalValue = -1;
          }
        };
        $scope.$on('$destroy', function () {
          $scope.cleanup();
        });
      },
    };
  },
]);
