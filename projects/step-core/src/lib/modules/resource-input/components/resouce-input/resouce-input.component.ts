import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, filter, takeUntil, forkJoin, pipe, of } from 'rxjs';
import { AugmentedResourcesService, ResourceUploadResponse } from '../../../../client/step-client-module';
import { ResourceDialogsService } from '../../services/resource-dialogs.service';
import { ResourceInputBridgeService } from '../../services/resource-input-bridge.service';
import { UpdateResourceWarningResultState } from '../../shared/update-resource-warning-result-state.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';

const MAX_FILES = 1;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resouce-input.component.html',
  styleUrls: ['./resouce-input.component.scss'],
})
export class ResourceInputComponent implements OnInit, OnChanges, OnDestroy {
  private _augmentedResourcesService = inject(AugmentedResourcesService);
  private _resourceDialogsService = inject(ResourceDialogsService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);
  private _destroyRef = inject(DestroyRef);

  @Input() stModel?: string;
  @Input() stBounded?: boolean;
  @Input() supportsDirectory?: boolean;
  @Input() stType!: string;
  @Input() withSaveButton: boolean = false;
  @Input() saveButtonLabel: string = 'Save';
  @Input() withDownloadButton: boolean = true;
  @Input() withUploadResourceButton: boolean = true;
  @Input() withChooseExistingResourceButton: boolean = true;
  @Input() withClearButton: boolean = true;
  @Input() disableServerPath?: boolean;
  @Input() label?: string;
  @Input() withHelpIcon?: boolean;
  @Input() helpIconTooltip?: string;
  @Input() withDynamicSwitch?: boolean;
  @Input() showRequiredMarker?: boolean;
  @Input() isDisabled: boolean = false;
  @Input() preserveExistingResource: boolean = false;
  @Input() isInvalid?: boolean;
  @Input() isTouched?: boolean;

  @Output() stModelChange = new EventEmitter<string>();
  @Output() dynamicSwitch = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() filesChange = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() initializingResourceChange = new EventEmitter<boolean>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly uploadTerminator$ = new Subject<void>();

  initializingResource?: boolean;
  isResource?: boolean;
  resourceId?: string;
  downloadResourceUrl?: string;
  absoluteFilepath?: string;
  resourceNotExisting?: boolean;
  resourceFilename?: string;
  progress$?: Observable<number>;
  response$?: Observable<ResourceUploadResponse>;
  lastStModelValue?: string;
  private uploadedResourceIds = new Set<string>();

  ngOnInit(): void {
    this._resourceInputBridgeService.deleteUploadedResource$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.deleteUploadedResource();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.stModelChanges(changes);
  }

  ngOnDestroy(): void {
    this.uploadTerminator$.next();
    this.uploadTerminator$.complete();
  }

  protected onStModelChange(value: string) {
    this.stModelChange.emit(value);
  }

  protected onBlur(): void {
    if (this.withSaveButton) {
      return;
    }

    this.setStModel(this.stModel);
    this.blur.emit();
  }

  protected saveChanges(): void {
    this.setStModel(this.stModel);
  }

  onFilesChange(files: File[]): void {
    if (files.length > MAX_FILES) {
      return;
    }

    const [file] = files;

    if (this.isResource && !this.resourceNotExisting && !this.preserveExistingResource) {
      if (!this.stBounded) {
        this._resourceDialogsService.showUpdateResourceWarning().subscribe((resultState) => {
          switch (resultState) {
            case UpdateResourceWarningResultState.NEW_RESOURCE:
              // Creating a new resource
              this.uploadResource({
                file,
              });
              break;

            case UpdateResourceWarningResultState.UPDATE_RESOURCE:
              // Updating resource
              this.uploadResource({
                file,
                resourceId: this.resourceId,
              });
              break;

            default:
              // Cancel
              break;
          }
        });
      } else {
        // Update the current resource
        this.uploadResource({
          file,
          resourceId: this.resourceId,
        });
      }
    } else {
      // Creating a new resource
      this.uploadResource({
        file,
      });
    }

    this.filesChange.emit();
  }

  protected openFileChooser(): void {
    if (!this.fileInput) {
      return;
    }

    this.fileInput.nativeElement.click();
  }

  protected onChooseFile(): void {
    if (!this.fileInput) {
      return;
    }

    if (!this.fileInput.nativeElement.files) {
      return;
    }

    const files = Array.from(this.fileInput.nativeElement.files);

    this.onFilesChange(files);
  }

  protected selectResource(): void {
    this._resourceDialogsService
      .showSearchResourceDialog(this.stType)
      .pipe(filter((resourceId) => !!resourceId))
      .subscribe((resourceId) => {
        this.setResourceIdToFieldValue(resourceId);
      });
  }

  protected clear(): void {
    this.absoluteFilepath = '';
    this.resourceFilename = '';
    this.setStModel('');
    this.deleteUploadedResource();
    this.blur.emit();
    this.filesChange.emit();

    if (!this.fileInput) {
      return;
    }

    this.fileInput.nativeElement.value = '';
  }

  private stModelChanges(changes: SimpleChanges): void {
    if (!changes['stModel']) {
      return;
    }

    if (changes['stModel'].currentValue !== changes['stModel'].previousValue || changes['stModel'].firstChange) {
      this.stModel = this.stModel || '';
      this.lastStModelValue = this.stModel;
      this.resourceId = this.stModel.replace('resource:', '');
      this.downloadResourceUrl = this._augmentedResourcesService.getDownloadResourceUrl(this.resourceId);
      this.isResource = !!this.stModel && typeof this.stModel === 'string' && this.stModel.startsWith('resource:');

      if (this.isResource) {
        this.initResource(this.resourceId);
      } else {
        this.absoluteFilepath = this.stModel;
      }
    }
  }

  initResource(id: string): void {
    this.initializingResource = true;
    this.initializingResourceChange.emit(this.initializingResource);

    this._augmentedResourcesService
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
      .getResource(id)
      .subscribe((resource) => {
        if (resource) {
          this.resourceNotExisting = false;
          this.resourceFilename = resource.resourceName;
        } else {
          this.resourceNotExisting = true;
        }

        this.initializingResource = false;
        this.initializingResourceChange.emit(this.initializingResource);
      });
  }

  private setStModel(stModel: string = '', forceChange?: boolean) {
    if (this.stModel === stModel && !forceChange) {
      return;
    }
    this.stModel = stModel;
    this.stModelChange.emit(stModel);
  }

  private setResourceIdToFieldValue(resourceId: string, forceChange?: boolean): void {
    this.setStModel(`resource:${resourceId}`, forceChange);
  }

  private uploadResource({ file, resourceId }: { file: File; resourceId?: string }): void {
    if (!file) {
      return;
    }

    const directory = !!this.supportsDirectory && file.name.endsWith('.zip');

    // do not perform any duplicate check for bounded resources
    // as we do not want to link bounded resources to any other resource
    const { progress$, response$ } = this._augmentedResourcesService.createResourceWithProgress({
      file,
      queryParams: {
        type: this.stType,
        duplicateCheck: !this.stBounded,
        directory,
      },
      resourceId,
    });

    this.progress$ = progress$;

    this.uploadTerminator$.next();

    response$.pipe(takeUntil(this.uploadTerminator$)).subscribe((resourceUploadResponse) => {
      this.uploadComplete.emit();

      delete this.progress$;

      const resourceId = resourceUploadResponse.resource!.id!;

      if (!resourceUploadResponse.similarResources?.length) {
        // No similar resource found
        this.setResourceIdToFieldValue(resourceId, true);
        this.resourceFilename = resourceUploadResponse.resource!.resourceName;
        // Exclude current resource id to be deleted, in case if it is a reupload of the same resource
        this.deleteUploadedResource(resourceId);
        this.uploadedResourceIds.add(resourceId);
      } else {
        this._resourceDialogsService
          .showFileAlreadyExistsWarning(resourceUploadResponse.similarResources)
          .subscribe((existingResourceId) => {
            if (existingResourceId) {
              // Linking to an existing resource
              this.setResourceIdToFieldValue(existingResourceId);
              // Delete the previously uploaded resource
              this._augmentedResourcesService.deleteResource(resourceId).subscribe();
            } else {
              // Creating a new resource
              this.setResourceIdToFieldValue(resourceId);
              this.uploadedResourceIds.add(resourceId);
            }
          });
      }
    });
  }

  /*
   * Clean up all resources but the initial one
   */
  private deleteUploadedResource(...excludedIds: string[]): void {
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
}
