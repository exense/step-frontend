import { IDirective } from 'angular';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';

export const REPORT_NODE_WRAPPER = 'stReportNodeWrapper';

class ReportNodeWrapperCtrl {
  id?: string;
  showArtefact?: boolean;
}

class ReportNodeWrapperDirective implements IDirective {
  scope = {
    id: '=',
    showArtefact: '=',
  };
  controller = ReportNodeWrapperCtrl;
  controllerAs = REPORT_NODE_WRAPPER;
  bindToController = true;
  template = `<reportnode
       id="${REPORT_NODE_WRAPPER}.id"
       show-artefact="${REPORT_NODE_WRAPPER}.showArtefact">
    </reportnode>`;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(REPORT_NODE_WRAPPER, () => new ReportNodeWrapperDirective());
