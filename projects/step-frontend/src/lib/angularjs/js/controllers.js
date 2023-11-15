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
  'ui.bootstrap',
]);

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
