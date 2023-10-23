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
  .module('screenConfigurationControllers', ['step'])

  .run(function (ViewRegistry, EntityRegistry) {
    ViewRegistry.registerDashlet(
      'admin/controller',
      'Screens',
      'partials/screenconfiguration/screenConfiguration.html',
      'screens',
      false,
      1
    );
    ViewRegistry.registerDashlet(
      'settings',
      'Screens',
      'partials/screenconfiguration/screenConfiguration.html',
      'screens',
      false,
      1
    );
  })
  // FIXME: find solution to add EntityRegistry.registerEntity(Input

  .factory('ScreenTemplates', function ($http, $q) {
    var api = {};

    var screensCache = {};

    api.clearCache = function () {
      screensCache = {};
    };

    api.getScreens = function (screenId) {
      return $q(function (resolve, reject) {
        $http.get('rest/screens').then(function (response) {
          resolve(response.data);
        });
      });
    };

    api.getScreenInputsByScreenId = function (screenId, params) {
      return $q(function (resolve, reject) {
        if (!params && screensCache[screenId]) {
          return resolve(screensCache[screenId]);
        } else {
          $http({ url: 'rest/screens/' + screenId, method: 'POST', data: params }).then(function (response) {
            var screenInputs = response.data;
            screensCache[screenId] = screenInputs;
            resolve(screenInputs);
          });
        }
      });
    };

    api.getScreenInputByScreenId = function (screenId, screenInputId) {
      return $q(function (resolve, reject) {
        $http.get('rest/screens/' + screenId + '/' + screenInputId).then(function (response) {
          resolve(response.data);
        });
      });
    };

    api.getScreenInputModel = function (value, input) {
      var bean = new Bean(value);
      return function (value) {
        if (angular.isDefined(value)) {
          bean.setProperty(input.id, value);
        } else {
          return bean.getProperty(input.id);
        }
      };
    };

    return api;
  });
