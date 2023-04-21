import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AbstractArtefact, CallFunction, DynamicValueString } from '../../client/step-client-module';
import {
  DynamicFieldGroupValue,
  DynamicFieldsSchema,
  SchemasFactoryService,
} from '../../modules/dynamic-forms/dynamic-forms.module';
import { EntityScopeResolver } from '../../modules/entity/services/entity-scope-resolver';
import { ArtefactRefreshNotificationService } from '../../services/artefact-refresh-notification.service';
import { DynamicAttributePipe } from '../../pipes/dynamic-attribute.pipe';
import { Entity } from '../../modules/entity/types/entity';

interface ReferenceMeta {
  icon: string;
  tooltip?: string;
  description: string;
  isError?: boolean;
}

/**
 * CallPlan and CallFunction artefacts are the subtypes of AbstractArtefact by it's logic
 * But as these types are generated, we have a type collision here.
 * The _class field is removed here, to prevent typescript error
 * when autogenerated AbstractArtefact's descendants will be passed as input
 */
type Artefact = Omit<AbstractArtefact, '_class'>;

export abstract class ReferenceArtefactNameConfig<A extends Artefact, T = any> {
  abstract readonly artefactClass: string;
  abstract readonly captions: {
    searchReference: string;
    dynamicReference: string;
    referenceNotFound: string;
    referenceLabel: string;
    editSelectionCriteria: string;
    selectionCriteria: string;
    selectionCriteriaDescription: string;
    addSelectionCriteriaLabel: string;
  };
  abstract readonly attributesScreenId?: string;
  abstract getSearchAttributes(artefact: A): DynamicValueString | undefined;
  abstract lookupReference(artefact: A): Observable<T>;
}

@Component({
  selector: 'step-reference-artefact-name',
  templateUrl: './reference-artefact-name.component.html',
  styleUrls: ['./reference-artefact-name.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReferenceArtefactNameComponent<A extends Artefact, T = any> implements OnChanges, OnInit, OnDestroy {
  private _schemaFactory = inject(SchemasFactoryService);
  private _entityScopeResolver = inject(EntityScopeResolver);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _artefactRefreshNotification = inject(ArtefactRefreshNotificationService, { optional: true });
  readonly _artefactNameConfig = inject<ReferenceArtefactNameConfig<A, T>>(ReferenceArtefactNameConfig);

  private terminator$ = new Subject<void>();

  @Input() isDisabled: boolean = false;
  @Input() artefact?: A;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() referenceUpdate = new EventEmitter<T | undefined>();
  protected artefactName: string = '';
  protected artefactReferenceAttributes?: DynamicFieldGroupValue;
  protected referenceString: string = '';
  protected reference?: any;
  protected isEditorMode: boolean = false;
  protected referenceMeta?: ReferenceMeta;
  protected schema?: DynamicFieldsSchema;

  ngOnInit(): void {
    this.setupArtefactExternalRefresh();
    this.initSchema();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cArtefact = changes['artefact'];
    if (cArtefact?.previousValue !== cArtefact?.currentValue || cArtefact.firstChange) {
      this.initArtefactName(cArtefact?.currentValue);
      this.parseArtefactKeywordAttributes(cArtefact?.currentValue);
      this.loadArtefactReference(cArtefact?.currentValue);
    }
  }

  onArtefactNameChange(newName: string): void {
    this.artefactName = newName;
    if (!this.artefact) {
      return;
    }
    if (!this.artefact.attributes) {
      this.artefact.attributes = {};
    }
    this.artefact.attributes['name'] = newName;
    this.onSave.emit();
  }

  updateReferenceAttributes(attributes?: DynamicFieldGroupValue): void {
    if (!this.artefact) {
      return;
    }

    this.artefactReferenceAttributes = attributes;
    const attributesString = JSON.stringify(attributes);
    const searchAttributes = this._artefactNameConfig.getSearchAttributes(this.artefact);
    if (searchAttributes?.value !== attributesString) {
      searchAttributes!.value = attributesString;
      this.loadArtefactReference(this.artefact);
    }
    this.createReferenceString(this.artefactReferenceAttributes);

    this.onSave.emit();
  }

  private initArtefactName(artefact?: CallFunction): void {
    this.artefactName = '';
    this._changeDetectorRef.detectChanges();
    this.artefactName = artefact?.attributes?.['name'] || '';
  }

  private parseArtefactKeywordAttributes(artefact?: any): void {
    if (!artefact) {
      this.artefactReferenceAttributes = undefined;
      this.createReferenceString(this.artefactReferenceAttributes);
      return;
    }

    try {
      const searchAttributes = this._artefactNameConfig.getSearchAttributes(artefact);
      let attributesJson = searchAttributes?.value;
      if (!attributesJson) {
        this.artefactReferenceAttributes = undefined;
      } else {
        const parsedAttributes = JSON.parse(attributesJson) as DynamicFieldGroupValue | Record<string, string>;
        this.artefactReferenceAttributes = Object.entries(parsedAttributes).reduce((res, [key, value]) => {
          res[key] =
            typeof value === 'string'
              ? {
                  value,
                  dynamic: !!searchAttributes?.dynamic,
                  expression: searchAttributes?.expression ?? '',
                }
              : value;
          return res;
        }, {} as DynamicFieldGroupValue);
      }
    } catch (err) {
      this.artefactReferenceAttributes = undefined;
    }
    this.createReferenceString(this.artefactReferenceAttributes);
  }

  private createReferenceString(attributes?: DynamicFieldGroupValue): void {
    if (!attributes) {
      this.referenceString = '';
      return;
    }

    const nameValue = DynamicAttributePipe.transform(attributes['name']) || '';
    const namePart = nameValue ? `name=${nameValue}` : '';

    const otherParts = Object.entries(attributes)
      .filter(([key]) => key !== 'name')
      .map(([key, attribute]) => `${key}=${DynamicAttributePipe.transform(attribute) || ''}`);

    this.referenceString =
      otherParts.length === 0 ? nameValue.toString() : [namePart, ...otherParts].filter((part) => !!part).join(', ');
  }

  private hasDynamicParameters(): boolean {
    return Object.values(this.artefactReferenceAttributes || {}).some((attribute) => attribute.dynamic);
  }

  private isEmpty(): boolean {
    return Object.values(this.artefactReferenceAttributes || {}).reduce((res, attribute) => {
      const isEmpty = attribute.dynamic ? !attribute.expression : !attribute.value;
      return res && isEmpty;
    }, true);
  }

  private loadArtefactReference(artefact?: A): void {
    if (!artefact) {
      this.reference = undefined;
      this.referenceUpdate.emit(undefined);
      this.referenceMeta = undefined;
      return;
    }

    if ((artefact as any as AbstractArtefact)?._class !== this._artefactNameConfig.artefactClass) {
      // For some reason and angularJS template, the template doesn't switch in time.
      // It creates the situation when non keyword artefact passed to this component.
      // In that case lookup with throw exception on the backend.
      // To avoid it, this if statement was added.
      // It could be removed when whole editor's form will be migrated
      return;
    }

    if (this.isEmpty()) {
      this.reference = undefined;
      this.referenceUpdate.emit(undefined);
      this.referenceMeta = {
        icon: 'search',
        description: this._artefactNameConfig.captions.searchReference,
      };
      if (!this.isDisabled && !this.isEditorMode) {
        this.isEditorMode = true;
      }
      return;
    }

    this._artefactNameConfig.lookupReference(artefact).subscribe((reference) => {
      this.reference = reference;
      this.referenceUpdate.emit(reference);
      if (!reference) {
        if (this.hasDynamicParameters()) {
          this.referenceMeta = {
            icon: 'zap',
            description: this._artefactNameConfig.captions.dynamicReference,
          };
        } else {
          this.referenceMeta = {
            icon: 'alert-circle',
            description: this._artefactNameConfig.captions.referenceNotFound,
            isError: true,
          };
        }
        return;
      }
      const entityScope = this._entityScopeResolver.getScope(reference as Entity);
      this.referenceMeta = entityScope
        ? {
            icon: entityScope.icon,
            tooltip: entityScope.tooltip,
            description: entityScope.tenant,
          }
        : undefined;
    });
  }

  private setupArtefactExternalRefresh(): void {
    if (!this._artefactRefreshNotification) {
      return;
    }
    this._artefactRefreshNotification.refreshArtefact$
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => this.initArtefactName(this.artefact));
  }

  private initSchema(): void {
    const screenId = this._artefactNameConfig.attributesScreenId;
    if (!screenId) {
      return;
    }
    this._schemaFactory.buildAttributesSchemaForScreen(screenId).subscribe((schema) => (this.schema = schema));
  }
}
