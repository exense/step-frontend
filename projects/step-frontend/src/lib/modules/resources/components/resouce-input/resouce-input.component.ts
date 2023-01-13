import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AugmentedResourcesService, ResourceUploadResponse } from '@exense/step-core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ResourceDialogsService } from '../../../context-menu/context-menu.module';

const MAX_FILES = 1;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resouce-input.component.html',
  styleUrls: ['./resouce-input.component.scss'],
})
export class ResourceInputComponent implements OnChanges, OnDestroy {
  @Input() stModel!: string;
  @Input() stBounded?: boolean;
  @Input() stDirectory?: boolean;
  @Input() stType!: string;
  @Input() withSaveButton?: boolean;
  @Input() saveButtonLabel?: string = 'Save';
  @Input() uploadOnly?: boolean;
  @Input() disableServerPath?: boolean;
  @Input() label?: string;
  @Input() withHelpIcon?: boolean;
  @Input() helpIconTooltip?: string;

  @Output() stModelChange = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly terminator$ = new Subject<void>();

  isResource?: boolean;
  resourceId?: string;
  downloadResourceUrl?: string;
  absoluteFilepath?: string;
  resourceNotExisting?: boolean;
  resourceFilename?: string;
  progress$?: Observable<number>;
  response$?: Observable<ResourceUploadResponse>;
  lastStModelValue?: string;

  constructor(
    private _augmentedResourcesService: AugmentedResourcesService,
    private _resourceDialogsService: ResourceDialogsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.stModelChanges(changes);
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  onBlur(): void {
    if (this.withSaveButton) {
      return;
    }

    this.setStModel(this.stModel);
  }

  saveChanges(): void {
    this.setStModel(this.stModel);
  }

  onFilesChange(files: File[]): void {
    if (files.length > MAX_FILES) {
      return;
    }

    const [file] = files;

    if (this.isResource && !this.resourceNotExisting) {
      if (!this.stBounded) {
        this._resourceDialogsService.showUpdateResourceWarning().subscribe({
          next: (updateResource) => {
            if (updateResource) {
              // Updating resource
              this.uploadResource({
                file,
                resourceId: this.resourceId,
              });
            } else {
              // Creating a new resource
              this.uploadResource({
                file,
              });
            }
          },
          error: () => {
            // Cancel
          },
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
  }

  openFileChooser(): void {
    if (!this.fileInput) {
      return;
    }

    this.fileInput.nativeElement.click();
  }

  onChooseFile(): void {
    if (!this.fileInput) {
      return;
    }

    if (!this.fileInput.nativeElement.files) {
      return;
    }

    const files = Array.from(this.fileInput.nativeElement.files);

    this.onFilesChange(files);
  }

  selectResource(): void {
    this._resourceDialogsService.showSearchResourceDialog(this.stType).subscribe({
      next: (resourceId) => {
        this.setResourceIdToFieldValue(resourceId);
      },
      error: () => {
        // Cancel
      },
    });
  }

  clear(): void {
    this.absoluteFilepath = '';
    this.setStModel('');
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
      this.isResource =
        Boolean(this.stModel) && typeof this.stModel === 'string' && this.stModel.startsWith('resource:');

      if (this.isResource) {
        this.initResource(this.resourceId);
      } else {
        this.absoluteFilepath = this.stModel;
      }
    }
  }

  private initResource(id: string): void {
    this._augmentedResourcesService.getResource(id).subscribe((resource) => {
      if (resource) {
        this.resourceNotExisting = false;
        this.resourceFilename = resource.resourceName;
      } else {
        this.resourceNotExisting = true;
      }
    });
  }

  private setStModel(stModel: string) {
    this.stModel = stModel;
    this.stModelChange.emit(stModel);
  }

  private setResourceIdToFieldValue(resourceId: string): void {
    this.setStModel(`resource:${resourceId}`);
  }

  private uploadResource({ file, resourceId }: { file: File; resourceId?: string }): void {
    if (!file) {
      return;
    }

    // do not perform any duplicate check for bounded resources
    // as we do not want to link bounded resources to any other resource
    const { progress$, response$ } = this._augmentedResourcesService.createResourceWithProgress({
      file,
      queryParams: {
        type: this.stType,
        duplicateCheck: !this.stBounded,
        directory: Boolean(this.stDirectory),
      },
      resourceId,
    });

    this.progress$ = progress$;

    this.terminator$.next();

    response$.pipe(takeUntil(this.terminator$)).subscribe((resourceUploadResponse) => {
      delete this.progress$;

      const resourceId = resourceUploadResponse.resource!.id!;

      if (!resourceUploadResponse.similarResources) {
        // No similar resource found
        this.setResourceIdToFieldValue(resourceId);
        this.resourceFilename = resourceUploadResponse.resource!.resourceName;
      } else {
        if (resourceUploadResponse.similarResources.length >= 1) {
          this._resourceDialogsService.showFileAlreadyExistsWarning(resourceUploadResponse.similarResources).subscribe({
            next: (existingResourceId) => {
              if (existingResourceId) {
                // Linking to an existing resource
                this.setResourceIdToFieldValue(existingResourceId);
                // Delete the previously uploaded resource
                this._augmentedResourcesService.deleteResource(resourceId).subscribe();
              } else {
                // Creating a new resource
                this.setResourceIdToFieldValue(resourceId);
              }
            },
            error: () => {
              // Cancel
            },
          });
        }
      }
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(
    'stepResourceInput',
    downgradeComponent({
      component: ResourceInputComponent,
    })
  );
