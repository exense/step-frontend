import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AbstractArtefact,
  AugmentedKeywordsService,
  CallFunction,
  Function as Keyword,
} from '../../client/step-client-module';
import { AJS_MODULE } from '../../shared';
import { EntityScopeResolver, Entity } from '../../modules/entity/entity.module';
import { DynamicFieldsSchema, DynamicFieldGroupValue } from '../../modules/dynamic-forms/dynamic-forms.module';
import { DynamicAttributePipe } from '../../pipes/dynamic-attribute.pipe';
import { ArtefactRefreshNotificationService } from '../../services/artefact-refresh-notification.service';
import { Subject, takeUntil } from 'rxjs';

interface KeywordMeta {
  icon: string;
  tooltip?: string;
  description: string;
  isError?: boolean;
}

const KEYWORD_ATTRIBUTES_SCHEMA: DynamicFieldsSchema = {
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
};

@Component({
  selector: 'step-keyword-name',
  templateUrl: './keyword-name.component.html',
  styleUrls: ['./keyword-name.component.scss'],
})
export class KeywordNameComponent implements OnChanges, OnInit, OnDestroy {
  private terminator$ = new Subject<void>();

  @Input() isDisabled: boolean = false;
  @Input() artefact?: CallFunction;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() keywordUpdate = new EventEmitter<Keyword | undefined>();
  readonly KEYWORD_ATTRIBUTES_SCHEMA = KEYWORD_ATTRIBUTES_SCHEMA;
  protected artefactName: string = '';
  protected artefactKeywordAttributes?: DynamicFieldGroupValue;
  protected referenceKeywordString: string = '';
  protected keyword?: Keyword;
  protected isEditorMode: boolean = false;
  protected keywordMeta?: KeywordMeta;

  constructor(
    private _keywordApi: AugmentedKeywordsService,
    private _entityScopeResolver: EntityScopeResolver,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() private _artefactRefreshNotification: ArtefactRefreshNotificationService
  ) {}

  ngOnInit(): void {
    this.setupArtefactExternalRefresh();
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
      this.loadArtefactKeyword(cArtefact?.currentValue);
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

  updateKeywordAttributes(attributes?: DynamicFieldGroupValue): void {
    if (!this.artefact) {
      return;
    }

    this.artefactKeywordAttributes = attributes;
    const attributesString = JSON.stringify(attributes);
    const reloadKeyword = this.artefact!.function!.value !== attributesString;
    if (reloadKeyword) {
      this.artefact!.function!.value = attributesString;
      this.loadArtefactKeyword(this.artefact);
    }
    this.createReferenceKeywordString(this.artefactKeywordAttributes);

    this.onSave.emit();
  }

  private initArtefactName(artefact?: CallFunction): void {
    this.artefactName = '';
    this._changeDetectorRef.detectChanges();
    this.artefactName = artefact?.attributes?.['name'] || '';
  }

  private parseArtefactKeywordAttributes(artefact?: any): void {
    if (!artefact) {
      this.artefactKeywordAttributes = undefined;
      this.createReferenceKeywordString(this.artefactKeywordAttributes);
      return;
    }

    try {
      let attributesJson = artefact?.function?.value;

      this.artefactKeywordAttributes = attributesJson ? JSON.parse(attributesJson) : undefined;
      if (typeof this.artefactKeywordAttributes?.['name'] === 'string') {
        this.artefactKeywordAttributes['name'] = {
          value: this.artefactKeywordAttributes?.['name'],
          dynamic: !!artefact?.function?.dynamic,
          expression: artefact?.function?.expression || '',
        };
      }
    } catch (err) {
      this.artefactKeywordAttributes = undefined;
    }
    this.createReferenceKeywordString(this.artefactKeywordAttributes);
  }

  private createReferenceKeywordString(attributes?: DynamicFieldGroupValue): void {
    if (!attributes) {
      this.referenceKeywordString = '';
      return;
    }

    const nameValue = DynamicAttributePipe.transform(attributes['name']) || '';
    const namePart = nameValue ? `name=${nameValue}` : '';

    const otherParts = Object.entries(attributes)
      .filter(([key]) => key !== 'name')
      .map(([key, attribute]) => `${key}=${DynamicAttributePipe.transform(attribute) || ''}`);

    this.referenceKeywordString =
      otherParts.length === 0 ? nameValue.toString() : [namePart, ...otherParts].filter((part) => !!part).join(', ');
  }

  private hasDynamicParameters(): boolean {
    return Object.values(this.artefactKeywordAttributes || {}).some((attribute) => attribute.dynamic);
  }

  private isEmptyKeywordName(): boolean {
    const nameAttribute = (this.artefactKeywordAttributes || {})['name'];
    if (!nameAttribute) {
      return true;
    }
    return nameAttribute.dynamic ? !nameAttribute.expression : !nameAttribute.value;
  }

  private loadArtefactKeyword(artefact?: CallFunction): void {
    if (!artefact) {
      this.keyword = undefined;
      this.keywordUpdate.emit(undefined);
      this.keywordMeta = undefined;
      return;
    }

    if ((artefact as AbstractArtefact)._class !== 'CallKeyword') {
      // For some reason and angularJS template, the template doesn't switch in time.
      // It creates the situation when non keyword artefact passed to this component.
      // In that case lookup with throw exception on the backend.
      // To avoid it, this if statement was added.
      // It could be removed when whole editor's form will be migrated
      return;
    }

    if (this.isEmptyKeywordName()) {
      this.keyword = undefined;
      this.keywordUpdate.emit(undefined);
      this.keywordMeta = {
        icon: 'search',
        description: 'Select a keyword',
      };
      if (!this.isDisabled && !this.isEditorMode) {
        this.isEditorMode = true;
      }
      return;
    }

    this._keywordApi.lookupCallFunction(artefact).subscribe((keyword) => {
      this.keyword = keyword;
      this.keywordUpdate.emit(keyword);
      if (!keyword) {
        if (this.hasDynamicParameters()) {
          this.keywordMeta = {
            icon: 'zap',
            description: 'Dynamic keyword',
          };
        } else {
          this.keywordMeta = {
            icon: 'alert-circle',
            description: 'Keyword not found',
            isError: true,
          };
        }
        return;
      }
      const entityScope = this._entityScopeResolver.getScope(keyword as Entity);
      this.keywordMeta = entityScope
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
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepKeywordName', downgradeComponent({ component: KeywordNameComponent }));
