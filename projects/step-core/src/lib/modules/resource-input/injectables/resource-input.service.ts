import { DestroyRef, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { BehaviorSubject, finalize, forkJoin, map, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ResourceConfig } from '../types/resource-config';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { UpdateResourceWarningResultState } from '../types/update-resource-warning-result-state.enum';
import { AugmentedResourcesService, Resource } from '../../../client/step-client-module';
import { ResourceDialogsService } from './resource-dialogs.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';

@Injectable()
export class ResourceInputService implements OnDestroy {
  private _destroyRef = inject(DestroyRef);

  private _augmentedResourcesService = inject(AugmentedResourcesService);
  private _resourceDialogsService = inject(ResourceDialogsService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  private initializingResourceInternal = signal(false);
  readonly initializingResource = this.initializingResourceInternal.asReadonly();

  private uploadProgress$ = new BehaviorSubject<Observable<undefined | number>>(of(undefined));
  readonly uploadProgress = toSignal(this.uploadProgress$.pipe(switchMap((progress$) => progress$)), {
    initialValue: undefined,
  });

  private config?: ResourceConfig;
  private uploadedResourceIds = new Set<string>();

  private deleteResourcesSubscription = this._resourceInputBridgeService.deleteUploadedResource$
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.deleteUploadedResources());

  setConfig(config?: ResourceConfig): void {
    this.config = config;
  }

  ngOnDestroy(): void {
    this.uploadProgress$.complete();
  }

  getDownloadUrl(resourceId?: string): string | undefined {
    if (!resourceId) {
      return undefined;
    }
    return this._augmentedResourcesService.getDownloadResourceUrl(resourceId);
  }

  initResource(resourceId: string): Observable<Resource | undefined> {
    this.initializingResourceInternal.set(true);
    return this._augmentedResourcesService
      .overrideInterceptor(
        pipe(
          catchError((error: HttpHeaderResponse) => {
            if (error.status === HttpStatusCode.NotFound) {
              const empty = new HttpResponse({ status: HttpStatusCode.NoContent });
              return of(empty);
            }
            throw error;
          }),
        ),
      )
      .getResource(resourceId)
      .pipe(
        map((resource) => resource),
        finalize(() => this.initializingResourceInternal.set(false)),
      );
  }

  showUpdateResourceWarning(): Observable<UpdateResourceWarningResultState | undefined> {
    return this._resourceDialogsService.showUpdateResourceWarning();
  }

  showSelectResourceDialog(): Observable<string | undefined> {
    if (!this.config) {
      throw 'Config not set';
    }

    return this._resourceDialogsService.showSearchResourceDialog(this.config.type);
  }

  uploadResource(file: File, resourceId?: string): Observable<Resource | undefined> {
    if (!this.config) {
      throw 'Config not set';
    }

    if (!file) {
      return of(undefined);
    }

    const type = this.config.type;
    const directory = !!this.config.supportsDirectory && file.name.endsWith('.zip');
    // do not perform any duplicate check for bounded resources
    // as we do not want to link bounded resources to any other resource
    const duplicateCheck = !this.config.isBounded;

    const { progress$, response$ } = this._augmentedResourcesService.createResourceWithProgress({
      file,
      queryParams: { type, duplicateCheck, directory },
      resourceId,
    });

    this.uploadProgress$.next(progress$);

    return response$.pipe(
      takeUntilDestroyed(this._destroyRef),
      switchMap((response) => {
        this.uploadProgress$.next(of(undefined));
        const responseResourceId = response.resource!.id!;

        // Exclude current resource id to be deleted, in case if it is a reupload of the same resource
        this.deleteUploadedResources(responseResourceId);
        this.uploadedResourceIds.add(responseResourceId);
        return of(response.resource);
      }),
      switchMap((resource) => {
        if (!resource || resource.resourceName === file.name) {
          return of(resource);
        }

        resource.resourceName = file.name;
        return this._augmentedResourcesService.saveResource(resource);
      }),
    );
  }

  deleteUploadedResources(...excludedIds: string[]): void {
    if (!this.uploadedResourceIds || this.uploadedResourceIds.size === 0) {
      return;
    }

    const cleanupIds = Array.from(this.uploadedResourceIds);
    const excluded = new Set(excludedIds);
    const requests = cleanupIds
      .filter((id) => !excluded.has(id))
      .map((id) => this._augmentedResourcesService.deleteResource(id).pipe(map(() => id)));

    forkJoin(requests).subscribe((ids) => {
      ids.forEach((id) => this.uploadedResourceIds.delete(id));
    });
  }
  private deleteResource(id: string): void {
    this._augmentedResourcesService.deleteResource(id).subscribe();
  }
}
