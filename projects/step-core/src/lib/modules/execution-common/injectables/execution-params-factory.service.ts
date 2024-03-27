import { inject, Injectable } from '@angular/core';
import { ArtefactFilter, ExecutionParameters } from '../../../client/step-client-module';
import { ExecutionParamsConfig } from '../types/execution-params-config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root',
})
export class ExecutionParamsFactoryService {
  private _authService = inject(AuthService);

  create(config: ExecutionParamsConfig): ExecutionParameters {
    const {
      includeUserId,
      includedTestCases,
      simulate,
      description,
      repositoryObject,
      customParameters,
      isolatedExecution,
    } = config;

    const userID = includeUserId ? this._authService.getUserID() : undefined;
    const mode = simulate ? 'SIMULATION' : 'RUN';

    let artefactFilter: ArtefactFilter | undefined;
    if (includedTestCases) {
      if (includedTestCases.by === 'id') {
        (artefactFilter as any) = {
          class: 'step.artefacts.filters.TestCaseIdFilter',
          includedIds: includedTestCases.list,
        };
      } else if (includedTestCases.by === 'name') {
        (artefactFilter as any) = {
          class: 'step.artefacts.filters.TestCaseFilter',
          includedNames: includedTestCases.list,
        };
      } else if (includedTestCases.by === 'all') {
        (artefactFilter as any) = undefined;
      } else {
        throw `Unsupported clause ${includedTestCases.by}`;
      }
    }
    return {
      userID,
      description,
      mode,
      repositoryObject,
      exports: [],
      isolatedExecution,
      artefactFilter,
      customParameters,
    };
  }
}
