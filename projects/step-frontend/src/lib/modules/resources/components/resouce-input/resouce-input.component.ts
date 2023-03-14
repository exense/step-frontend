import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedResourcesService,
  ResourceInputBridgeService,
  ResourceUploadResponse,
} from '@exense/step-core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ResourceDialogsService } from '../../services/resource-dialogs.service';

const MAX_FILES = 1;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resouce-input.component.html',
  styleUrls: ['./resouce-input.component.scss'],
})
export class ResourceInputComponent implements OnInit, OnChanges, OnDestroy {
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
  @Input() withDynamicSwitch?: boolean;

  @Output() stModelChange = new EventEmitter<string>();
  @Output() dynamicSwitch = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly terminator$ = new Subject<void>();
  private readonly uploadTerminator$ = new Subject<void>();

  isResource?: boolean;
  resourceId?: string;
  downloadResourceUrl?: string;
  absoluteFilepath?: string;
  resourceNotExisting?: boolean;
  resourceFilename?: string;
  progress$?: Observable<number>;
  response$?: Observable<ResourceUploadResponse>;
  lastStModelValue?: string;
  lastUploadedResourceId?: string;

  constructor(
    private _augmentedResourcesService: AugmentedResourcesService,
    private _resourceDialogsService: ResourceDialogsService,
    private _resourceInputBridgeService: ResourceInputBridgeService
  ) {}

  ngOnInit(): void {
    this._resourceInputBridgeService.deleteLastUploadedResource$.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this.deleteLastUploadedResource();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.stModelChanges(changes);
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
    this.uploadTerminator$.next();
    this.uploadTerminator$.complete();
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
    this._resourceDialogsService
      .showSearchResourceDialog(this.stType)
      .pipe(filter((resourceId) => Boolean(resourceId)))
      .subscribe((resourceId) => {
        this.setResourceIdToFieldValue(resourceId);
      });
  }

  clear(): void {
    this.absoluteFilepath = '';
    this.setStModel('');
    this.deleteLastUploadedResource();

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

    this.uploadTerminator$.next();

    response$.pipe(takeUntil(this.uploadTerminator$)).subscribe((resourceUploadResponse) => {
      delete this.progress$;

      const resourceId = resourceUploadResponse.resource!.id!;

      if (!resourceUploadResponse.similarResources) {
        // No similar resource found
        this.setResourceIdToFieldValue(resourceId);
        this.resourceFilename = resourceUploadResponse.resource!.resourceName;
        this.lastUploadedResourceId = resourceId;
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
                this.lastUploadedResourceId = resourceId;
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

  private deleteLastUploadedResource(): void {
    if (!this.lastUploadedResourceId) {
      return;
    }

    this._augmentedResourcesService.deleteResource(this.lastUploadedResourceId).subscribe(() => {
      delete this.lastUploadedResourceId;
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
