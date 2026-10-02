import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AutomationPackageUpdateResult,
  HttpRequestContextHolderService,
  IdeService,
  RemoteDefaults,
  RemoteDeploymentRequest,
  RemoteExecution,
  RemoteExecutionRequest,
  SKIP_CONNECTION_RETRY,
} from '@exense/step-core';
import { defer, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdeRemoteApiService {
  private readonly _ideApi = inject(IdeService);
  private readonly _requestContextHolder = inject(HttpRequestContextHolderService);

  getRemoteDefaults(): Observable<RemoteDefaults> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._ideApi.getRemoteDefaults();
    });
  }

  deployRemote(request: RemoteDeploymentRequest): Observable<AutomationPackageUpdateResult> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._ideApi.deployRemote(request);
    });
  }

  executeRemote(request: RemoteExecutionRequest): Observable<RemoteExecution[]> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._ideApi.executeRemote(request);
    });
  }

  private skipConnectionRetry(): void {
    this._requestContextHolder.addContextToUpcomingRequest(new HttpContext().set(SKIP_CONNECTION_RETRY, true));
  }
}
