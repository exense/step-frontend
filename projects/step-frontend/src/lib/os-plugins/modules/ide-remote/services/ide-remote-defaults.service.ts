import { computed, inject, Injectable, signal } from '@angular/core';
import { IDE_MODE, RemoteDefaults, RemoteDeploymentRequest, RemoteExecutionRequest } from '@exense/step-core';
import { IdeRemoteApiService } from './ide-remote-api.service';

export interface IdeRemoteTarget {
  readonly url: string;
  readonly projectName?: string;
}

export type IdeRemoteOperation = 'deploy' | 'execute';

@Injectable({ providedIn: 'root' })
export class IdeRemoteDefaultsService {
  private readonly _ideMode = inject(IDE_MODE);
  private readonly _api = inject(IdeRemoteApiService);
  private initialized = false;

  private readonly loadingInternal = signal(false);
  readonly loading = this.loadingInternal.asReadonly();

  private readonly errorInternal = signal<string | undefined>(undefined);
  readonly error = this.errorInternal.asReadonly();

  private readonly defaultsInternal = signal<RemoteDefaults | undefined>(undefined);
  readonly hasDefaults = computed(() => !!this.defaultsInternal());

  readonly deployTarget = computed(() => this.getTarget(this.defaultsInternal()?.deploy));
  readonly executeTarget = computed(() => this.getTarget(this.defaultsInternal()?.execute));
  readonly deployError = computed(() => this.getOperationError('deploy'));
  readonly executeError = computed(() => this.getOperationError('execute'));
  readonly canDeploy = computed(() => !this.deployError());
  readonly canExecute = computed(() => !this.executeError());

  initialize(): void {
    if (!this._ideMode || this.initialized) {
      return;
    }

    this.initialized = true;
    this.loadDefaults();
  }

  getOperationError(operation: IdeRemoteOperation): string | undefined {
    if (!this._ideMode) {
      return 'Remote operations are available only in IDE mode.';
    }
    if (this.loading()) {
      return 'Remote defaults are loading.';
    }
    if (this.error()) {
      return this.error();
    }

    const settings = this.defaultsInternal()?.[operation];
    if (!settings) {
      return `${operation === 'deploy' ? 'Deployment' : 'Execution'} defaults are unavailable.`;
    }
    if (!settings.connection?.url?.trim()) {
      return `${operation === 'deploy' ? 'Deployment' : 'Execution'} target URL is missing.`;
    }
    return undefined;
  }

  getDeploymentRequest(): RemoteDeploymentRequest | undefined {
    return this.getOperationError('deploy') ? undefined : this.defaultsInternal()?.deploy;
  }

  getExecutionRequest(): RemoteExecutionRequest | undefined {
    return this.getOperationError('execute') ? undefined : this.defaultsInternal()?.execute;
  }

  private loadDefaults(): void {
    this.loadingInternal.set(true);

    this._api.getRemoteDefaults().subscribe({
      next: (defaults) => {
        this.defaultsInternal.set(defaults);
        this.errorInternal.set(defaults ? undefined : 'Remote defaults are unavailable.');
        this.loadingInternal.set(false);
      },
      error: () => {
        this.errorInternal.set('Could not load remote defaults.');
        this.loadingInternal.set(false);
      },
      complete: () => {
        if (this.loading()) {
          this.errorInternal.set('Remote defaults are unavailable.');
          this.loadingInternal.set(false);
        }
      },
    });
  }

  private getTarget(
    settings: RemoteDeploymentRequest | RemoteExecutionRequest | undefined,
  ): IdeRemoteTarget | undefined {
    const connection = settings?.connection;
    const url = connection?.url?.trim();
    return url ? { url, projectName: connection?.projectName } : undefined;
  }
}
