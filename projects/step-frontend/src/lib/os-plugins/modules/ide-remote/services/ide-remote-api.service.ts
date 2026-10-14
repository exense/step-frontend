import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AutomationPackageUpdateResult,
  HttpRequestContextHolderService,
  StudioService,
  RemoteDefaults,
  RemoteDeploymentRequest,
  RemoteExecution,
  RemoteExecutionRequest,
  SKIP_CONNECTION_RETRY,
} from '@exense/step-core';
import { defer, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdeRemoteApiService {
  private readonly _studioApi = inject(StudioService);
  private readonly _requestContextHolder = inject(HttpRequestContextHolderService);

  getRemoteDefaults(): Observable<RemoteDefaults> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._studioApi.getRemoteDefaults();
    });
  }

  deployRemote(request: RemoteDeploymentRequest): Observable<AutomationPackageUpdateResult> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._studioApi.deployRemote(request);
    });
  }

  executeRemote(request: RemoteExecutionRequest): Observable<RemoteExecution[]> {
    return defer(() => {
      this.skipConnectionRetry();
      return this._studioApi.executeRemote(request);
    });
  }

  private skipConnectionRetry(): void {
    this._requestContextHolder.addContextToUpcomingRequest(new HttpContext().set(SKIP_CONNECTION_RETRY, true));
  }
}
