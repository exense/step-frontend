import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { IDirective } from 'angular';

export const JSON_VIEWER_WRAPPER = 'stJsonViewerWrapper';

class JsonViewerWrapperCtrl {
  format?: 'kv' | 'json';
  json?: string | object;
}

class JsonViewerWrapperDirective implements IDirective {
  scope = {
    format: '=',
    json: '=',
  };
  controller = JsonViewerWrapperCtrl;
  controllerAs = JSON_VIEWER_WRAPPER;
  bindToController = true;
  template = `<json-viewer-extended format="${JSON_VIEWER_WRAPPER}.format" json="${JSON_VIEWER_WRAPPER}.json">
</json-viewer-extended>`;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(JSON_VIEWER_WRAPPER, () => new JsonViewerWrapperDirective());
