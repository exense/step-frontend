import { Component, computed, ElementRef, inject, input, Input, model, output, signal, viewChild } from '@angular/core';
import { filter, Observable, of, switchMap } from 'rxjs';
import { Resource } from '../../../../client/step-client-module';
import { UpdateResourceWarningResultState } from '../../types/update-resource-warning-result-state.enum';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ResourceInputConfigDirective } from '../../directives/resource-input-config.directive';
import { ResourceInputService } from '../../injectables/resource-input.service';
import { RESOURCE_INPUT } from '../../injectables/resource-input.token';

const MAX_FILES = 1;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resouce-input.component.html',
  styleUrls: ['./resouce-input.component.scss'],
  hostDirectives: [
    {
      directive: ResourceInputConfigDirective,
      inputs: [
        'type: stType',
        'isBounded',
        'supportsDirectory',
        'withSaveButton',
        'saveButtonLabel',
        'withChooseExistingResourceButton',
        'withClearButton',
        'withDynamicSwitch',
        'preserveExistingResource',
        'disableServerPath',
      ],
    },
  ],
  providers: [
    ResourceInputService,
    {
      provide: RESOURCE_INPUT,
      useFactory: () => {
        // Allow to override resource input definition on parent levels
        const current = inject(ResourceInputService, { self: true });
        const parent = inject(ResourceInputService, { skipSelf: true, optional: true });
        return parent ?? current;
      },
    },
  ],
})
export class ResourceInputComponent {
  private _resourceInputService = inject(RESOURCE_INPUT);
  protected _config = inject(ResourceInputConfigDirective, { self: true });

  readonly uploadProgress = this._resourceInputService.uploadProgress;

  readonly stModel = model<string | undefined>();

  readonly label = input<string | undefined>(undefined);
  readonly helpIconTooltip = input<string | undefined>(undefined);
  readonly showRequiredMarker = input(false);
  readonly isDisabled = input(false);

  @Input() isInvalid?: boolean;
  @Input() isTouched?: boolean;

  readonly dynamicSwitch = output();
  readonly blur = output();
  readonly filesChange = output();

  private fileInput = viewChild('fileInput', { read: ElementRef<HTMLInputElement> });

  protected readonly resourceId = computed(() => {
    const model = this.stModel();
    return !model ? undefined : model.replace('resource:', '');
  });

  protected readonly downloadResourceUrl = computed(() => this._resourceInputService.getDownloadUrl(this.resourceId()));

  readonly isResource = computed(() => {
    const model = this.stModel();
    return !!model && typeof model === 'string' && model.startsWith('resource:');
  });

  protected readonly absoluteFilepath = computed(() => {
    const model = this.stModel();
    const isResource = this.isResource();
    return !isResource ? model ?? '' : '';
  });

  private resource = signal<Resource | undefined>(undefined);
  readonly resourceNotExisting = computed(() => !this.resource());
  protected readonly resourceFilename = computed(() => this.resource()?.resourceName ?? '');

  private initResourceSubscription = toObservable(this.resourceId)
    .pipe(
      filter((resourceId) => !!resourceId),
      switchMap((resourceId) => this._resourceInputService.initResource(resourceId!)),
      takeUntilDestroyed(),
    )
    .subscribe((resource) => this.resource.set(resource));

  protected onBlur(): void {
    if (this._config.withSaveButton()) {
      return;
    }

    this.blur.emit();
  }

  protected saveChanges(): void {
    //this.setStModel(this.stModel);
  }

  onFilesChange(files: File[]): void {
    if (files.length > MAX_FILES) {
      return;
    }

    const [file] = files;

    let resource$: Observable<Resource | undefined>;

    if (this.isResource() && !this.resourceNotExisting && !this._config.preserveExistingResource()) {
      if (!this._config.isBounded()) {
        resource$ = this._resourceInputService.showUpdateResourceWarning().pipe(
          switchMap((resultState) => {
            switch (resultState) {
              case UpdateResourceWarningResultState.NEW_RESOURCE:
                // Creating a new resource
                return this._resourceInputService.uploadResource(file);
              case UpdateResourceWarningResultState.UPDATE_RESOURCE:
                return this._resourceInputService.uploadResource(file, this.resourceId());
              default:
                return of(undefined);
            }
          }),
        );
      } else {
        // Update the current resource
        resource$ = this._resourceInputService.uploadResource(file, this.resourceId());
      }
    } else {
      // Creating a new resource
      resource$ = this._resourceInputService.uploadResource(file);
    }

    resource$.subscribe((resource) => {
      if (resource) {
        this.setResourceIdToFieldValue(resource.id!);
        this.resource.set(resource);
      } else {
        this.stModel.set(undefined);
        this.resource.set(undefined);
      }
    });

    this.filesChange.emit();
  }

  protected openFileChooser(): void {
    this.fileInput()?.nativeElement?.click?.();
  }

  protected onChooseFile(): void {
    const fileInput = this.fileInput();
    if (!fileInput) {
      return;
    }

    if (!fileInput.nativeElement.files) {
      return;
    }

    const files = Array.from(fileInput.nativeElement.files) as File[];

    this.onFilesChange(files);
  }

  protected selectResource(): void {
    this._resourceInputService
      .showSelectResourceDialog()
      .pipe(filter((resourceId) => !!resourceId))
      .subscribe((resourceId) => {
        this.setResourceIdToFieldValue(resourceId!);
      });
  }

  protected clear(): void {
    this.stModel.set('');
    this.resource.set(undefined);
    this._resourceInputService.deleteUploadedResources();
    this.blur.emit();
    this.filesChange.emit();

    const fileInput = this.fileInput();
    if (!fileInput) {
      return;
    }

    fileInput.nativeElement.value = '';
  }

  private setResourceIdToFieldValue(resourceId: string): void {
    this.stModel.set(`resource:${resourceId}`);
  }
}
