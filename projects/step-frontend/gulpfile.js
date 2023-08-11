const { src, dest, parallel } = require('gulp');
const concat = require('gulp-concat');
const path = require('path');

//Determine node_modules path, because it can be different, depending on the configuration (workspace or not)
const NODE_MODULES_PATH = path.resolve(require.resolve('gulp'), '..', '..');

const DESTINATION = '../../dist/step-frontend/src/lib/angularjs';

const SCRIPTS = [
  './src/lib/angularjs/bower_components/jquery/dist/jquery.js',
  './src/lib/angularjs/bower_components/bootstrap/dist/js/bootstrap.js',
  './src/lib/angularjs/bower_components/chart.js/dist/Chart.js',
  './src/lib/angularjs/bower_components/underscore/underscore.js',
  './src/lib/angularjs/bower_components/angular/angular.js',
  './src/lib/angularjs/bower_components/ngstorage/ngStorage.js',
  './src/lib/angularjs/bower_components/angular-cookies/angular-cookies.js',
  './src/lib/angularjs/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
  './src/lib/angularjs/bower_components/datatables.net/js/jquery.dataTables.js',
  './src/lib/angularjs/bower_components/datatables.net-bs/js/dataTables.bootstrap.js',
  './src/lib/angularjs/bower_components/jstree/dist/jstree.js',
  './src/lib/angularjs/bower_components/jquery-file-download/src/Scripts/jquery.fileDownload.js',
  './src/lib/angularjs/bower_components/ng-file-upload/ng-file-upload.js',
  './src/lib/angularjs/js/angular-resizable.js',
  './src/lib/angularjs/bower_components/datatables.net-select/js/dataTables.select.js',

  './src/lib/angularjs/js/common.js',
  './src/lib/angularjs/js/app.js',
  './src/lib/angularjs/js/views.js',
  './src/lib/angularjs/js/ntables.js',
  './src/lib/angularjs/js/chart.js',
  './src/lib/angularjs/js/export.js',
  './src/lib/angularjs/js/asyncTask.js',
  './src/lib/angularjs/js/controllers.js',
  './src/lib/angularjs/js/controllers/entities.js',
  './src/lib/angularjs/js/controllers/scheduler.js',
  './src/lib/angularjs/js/controllers/grid.js',
  './src/lib/angularjs/js/controllers/plans.js',
  './src/lib/angularjs/js/controllers/planEditor.js',
  './src/lib/angularjs/js/controllers/artefacts.js',
  './src/lib/angularjs/js/controllers/functions.js',
  './src/lib/angularjs/js/controllers/parameters.js',
  './src/lib/angularjs/js/controllers/resources.js',
  './src/lib/angularjs/js/controllers/dashboards.js',
  './src/lib/angularjs/js/controllers/executions.js',
  './src/lib/angularjs/js/controllers/screenConfiguration.js',
  './src/lib/angularjs/js/controllers/repository.js',
  './src/lib/angularjs/js/controllers/reportNodes.js',
  './src/lib/angularjs/js/controllers/reportTable.js',
  './src/lib/angularjs/js/controllers/settings.js',
  './src/lib/angularjs/js/controllers/dynamicForms.js',
  './src/lib/angularjs/js/controllers/components.js',
  './src/lib/angularjs/js/datatable-ext-paginationinput.js',
];

const STYLES = [
  './src/lib/angularjs/bower_components/bootstrap/dist/css/bootstrap.css',
  './src/lib/angularjs/bower_components/jstree/dist/themes/default/style.css',
  './src/lib/angularjs/bower_components/tachyons/css/tachyons.css',
  './src/lib/angularjs/bower_components/angular-resizable/angular-resizable.min.css',
  './src/lib/angularjs/css/step.css',
  './src/lib/angularjs/css/step-variables.css',
  './src/lib/angularjs/js/chart.css',
];

const MAPS = ['./src/lib/angularjs/bower_components/bootstrap/dist/css/bootstrap.css.map'];

const FONTS = ['./src/lib/angularjs/bower_components/bootstrap/dist/fonts/**/*'];

const IMAGES = [
  './src/lib/angularjs/bower_components/jstree/dist/themes/default/*.png',
  './src/lib/angularjs/bower_components/jstree/dist/themes/default/*.gif',
];

const OTHER = [
  './src/lib/angularjs/**/*',
  './src/lib/angularjs/**/*',
  '!./src/lib/angularjs/bower_components/**/*',
  '!./src/lib/angularjs/node_modules/**/*',
  '!./src/lib/angularjs/js/**/*',
  '!./src/lib/angularjs/css/**/*',
  '!./src/lib/angularjs/Gruntfile.js',
  '!./src/lib/angularjs/*.json',
];

const scripts = () =>
  src(SCRIPTS)
    .pipe(concat('scripts.js'))
    .pipe(dest(`${DESTINATION}/app`));

const styles = () =>
  src(STYLES)
    .pipe(concat('styles.css'))
    .pipe(dest(`${DESTINATION}/app`));

const maps = () => src(MAPS).pipe(dest(`${DESTINATION}/app`));

const images = () => src(IMAGES).pipe(dest(`${DESTINATION}/app`));

const fonts = () => src(FONTS).pipe(dest(`${DESTINATION}/fonts`));

const others = () => src(OTHER, { nodir: true }).pipe(dest(DESTINATION, { base: './src/lib/angularjs' }));

exports.default = parallel(scripts, maps, styles, fonts, others, images);
