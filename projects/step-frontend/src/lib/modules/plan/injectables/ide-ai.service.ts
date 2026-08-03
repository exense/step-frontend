import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AiConfiguration,
  AiGenerateRequest,
  AiGenerateResponse,
  AiSpec,
  CommonEntitiesUrlsService,
  IdeService,
} from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class IdeAiService {
  private _ideApi = inject(IdeService);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  /**
   * Whether AI assisted test case creation is usable, and if not why. Resolved once, as it comes from the IDE
   * configuration which cannot change without a restart.
   */
  readonly configuration = toSignal(
    this._ideApi.getAiConfiguration().pipe(
      catchError(() =>
        of({
          available: false,
          apiKeyConfigured: false,
          message: 'The AI service is unavailable',
        } as AiConfiguration),
      ),
    ),
    { initialValue: undefined },
  );

  getSpec(testCaseName: string): Observable<AiSpec> {
    return this._ideApi.getAiSpec(testCaseName);
  }

  generate(request: AiGenerateRequest): Observable<AiGenerateResponse> {
    return this._ideApi.generateAiPlans(request);
  }

  navigateToExecution(executionId: string): void {
    this._router.navigateByUrl(this._commonEntitiesUrls.executionUrl(executionId, false));
  }
}
