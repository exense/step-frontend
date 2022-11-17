import { AJS_MODULE, RepositoryObjectReference } from '@exense/step-core';
import { IDirective } from 'angular';
import { getAngularJSGlobal } from '@angular/upgrade/static';

export const PLAN_EXECUTION_WRAPPER = 'planExecutionCommandsWrapper';

class PlanExecutionWrapperCtrl {
  description?: string;
  repositoryObjectRef?: RepositoryObjectReference;

  artefact(): RepositoryObjectReference {
    return this.repositoryObjectRef!;
  }
}

class PlanExecutionWrapperDirective implements IDirective {
  scope = {
    description: '=',
    repositoryObjectRef: '=',
  };
  controller = PlanExecutionWrapperCtrl;
  controllerAs = PLAN_EXECUTION_WRAPPER;
  bindToController = true;
  template = `
    <execution-commands description="${PLAN_EXECUTION_WRAPPER}.description" artefact="${PLAN_EXECUTION_WRAPPER}.artefact()">
    </execution-commands>
  `;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(PLAN_EXECUTION_WRAPPER, () => new PlanExecutionWrapperDirective());
