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
import { Observable, Subject, filter, takeUntil } from 'rxjs';
import { AugmentedResourcesService } from '../../client/augmented/step-augmented-client.module';
import { ResourceUploadResponse } from '../../client/generated';
import { ResourceDialogsService } from '../../services/resource-dialogs.service';
import { ResourceInputBridgeService } from '../../services/resource-input-bridge.service';
import { AJS_MODULE } from '../../shared';
import { UpdateResourceWarningResultState } from '../../shared/update-resource-warning-result-state.enum';

const MAX_FILES = 1;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resouce-input.component.html',
  styleUrls: ['./resouce-input.component.scss'],
})
export class ResourceInputComponent implements OnInit, OnChanges, OnDestroy {
  @Input() stModel?: string;
  @Input() stBounded?: boolean;
  @Input() stDirectory?: boolean;
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

  @Output() stModelChange = new EventEmitter<string>();
  @Output() dynamicSwitch = new EventEmitter<void>();
  @Output() filesChange = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly terminator$ = new Subject<void>();
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

  protected onStModelChange(value: string) {
    this.stModelChange.emit(value);
  }

  protected onBlur(): void {
    if (this.withSaveButton) {
      return;
    }

    this.setStModel(this.stModel);
  }

  protected saveChanges(): void {
    this.setStModel(this.stModel);
  }

  onFilesChange(files: File[]): void {
    if (files.length > MAX_FILES) {
      return;
    }

    const [file] = files;

    if (this.isResource && !this.resourceNotExisting) {
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
    this.deleteLastUploadedResource();
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

    this._augmentedResourcesService.getResource(id).subscribe((resource) => {
      if (resource) {
        this.resourceNotExisting = false;
        this.resourceFilename = resource.resourceName;
      } else {
        this.resourceNotExisting = true;
      }

      this.initializingResource = false;
    });
  }

  private setStModel(stModel: string = '') {
    if (this.stModel === stModel) {
      return;
    }
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
      this.uploadComplete.emit();

      delete this.progress$;

      const resourceId = resourceUploadResponse.resource!.id!;

      if (!resourceUploadResponse.similarResources?.length) {
        // No similar resource found
        this.setResourceIdToFieldValue(resourceId);
        this.resourceFilename = resourceUploadResponse.resource!.resourceName;
        this.deleteLastUploadedResource();
        this.lastUploadedResourceId = resourceId;
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
              this.lastUploadedResourceId = resourceId;
            }
          });
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
