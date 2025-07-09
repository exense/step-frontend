import { Component, computed, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { filter, Observable, of, switchMap } from 'rxjs';
import { Resource } from '../../../../client/step-client-module';
import { UpdateResourceWarningResultState } from '../../types/update-resource-warning-result-state.enum';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ResourceInputConfigDirective } from './resource-input-config.directive';
import { ResourceInputService } from '../../injectables/resource-input.service';
import { RESOURCE_INPUT } from '../../injectables/resource-input.token';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ResourceInputUtilsService } from '../../injectables/resource-input-utils.service';
import { ResourceInputCustomAction } from '../../types/resource-input-custom-action';

const MAX_FILES = 1;

type OnChange = (value?: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-resource-input',
  templateUrl: './resource-input.component.html',
  styleUrls: ['./resource-input.component.scss'],
  standalone: true,
  imports: [StepBasicsModule],
  hostDirectives: [
    {
      directive: ResourceInputConfigDirective,
      inputs: [
        'type: resourceType',
        'isBounded',
        'supportsDirectory',
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
export class ResourceInputComponent implements ControlValueAccessor {
  private _utils = inject(ResourceInputUtilsService);
  private _resourceInputService = inject(RESOURCE_INPUT);
  protected _config = inject(ResourceInputConfigDirective, { self: true });

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private fileInput = viewChild('fileInput', { read: ElementRef<HTMLInputElement> });

  readonly uploadProgress = this._resourceInputService.uploadProgress;

  readonly label = input<string | undefined>(undefined);
  readonly helpIconTooltip = input<string | undefined>(undefined);
  readonly showRequiredMarker = input(false);
  readonly isParentInvalid = input(false);
  readonly customActions = input<ResourceInputCustomAction[] | undefined>(undefined);

  readonly dynamicSwitch = output();
  readonly filesChange = output();
  readonly customActionInvoke = output<string>();

  protected readonly isDisabled = signal(false);
  protected readonly modelInternal = signal<string | undefined>(undefined);
  protected readonly hasCustomActions = computed(() => !!this.customActions()?.length);

  protected readonly resourceId = computed(() => this._utils.getResourceId(this.modelInternal()));

  protected readonly downloadResourceUrl = computed(() => this._resourceInputService.getDownloadUrl(this.resourceId()));

  readonly isResource = computed(() => this._utils.isResourceValue(this.modelInternal()));

  protected readonly absoluteFilepath = computed(() => {
    const model = this.modelInternal();
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

  constructor(protected _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  registerOnChange(onChange?: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch?: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  writeValue(value?: string): void {
    this.modelInternal.set(value);
  }

  protected handleModelChange(value?: string): void {
    this.modelInternal.set(value);
    this.onChange?.(value);
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  protected handleCustomAction(action: ResourceInputCustomAction): void {
    this.customActionInvoke.emit(action.type);
  }

  protected handleFilesChange(files: File[]): void {
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
        this.handleModelChange(this._utils.convertIdToResourceValue(resource.id!));
        this.resource.set(resource);
      } else {
        this.handleModelChange(undefined);
        this.resource.set(undefined);
      }
    });

    this.filesChange.emit();
  }

  protected openFileChooser(): void {
    this.fileInput()?.nativeElement?.click?.();
  }

  protected handleChooseFile(): void {
    const fileInput = this.fileInput();
    if (!fileInput) {
      return;
    }

    if (!fileInput.nativeElement.files) {
      return;
    }

    const files = Array.from(fileInput.nativeElement.files) as File[];

    this.handleFilesChange(files);
  }

  protected selectResource(): void {
    this._resourceInputService
      .showSelectResourceDialog()
      .pipe(filter((resourceId) => !!resourceId))
      .subscribe((resourceId) => {
        this.handleModelChange(this._utils.convertIdToResourceValue(resourceId!));
      });
  }

  protected clear(): void {
    this.handleModelChange(undefined);
    this.resource.set(undefined);
    this._resourceInputService.deleteUploadedResources();
    this.onTouch?.();
    this.filesChange.emit();

    const fileInput = this.fileInput();
    if (!fileInput) {
      return;
    }

    fileInput.nativeElement.value = '';
  }
}
