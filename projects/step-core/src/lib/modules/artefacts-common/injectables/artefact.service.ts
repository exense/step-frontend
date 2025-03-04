import { inject, Injectable, Type } from '@angular/core';
import { map } from 'rxjs';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
  PlansService,
  ReportNode,
} from '../../../client/step-client-module';
import {
  CustomRegistryType,
  CustomRegistryService,
  CustomRegistryItem,
  CustomComponent,
} from '../../custom-registeries/custom-registries.module';
import { AggregatedArtefactInfo, ReportNodeWithArtefact } from '../types/artefact-types';
import { TIME_UNIT_DICTIONARY, TIME_UNIT_LABELS, TimeUnit, TimeUnitDictKey } from '../../basics/types/time-unit.enum';
import { TimeConvertersFactoryService } from '../../basics/injectables/time-converters-factory.service';

export interface ArtefactType extends CustomRegistryItem {
  icon: string;
  description?: string;
  isSelectable?: boolean;
  inlineComponent?: Type<CustomComponent>;
  reportDetailsComponent?: Type<CustomComponent>;
}

export type SimpleValue = undefined | null | string | boolean | number | object | Array<unknown>;
export type ArtefactFieldValue = SimpleValue | DynamicValueString | DynamicValueInteger | DynamicValueBoolean;

@Injectable({
  providedIn: 'root',
})
export class ArtefactService {
  private _timeConverter = inject(TimeConvertersFactoryService).timeConverter();
  protected _customRegistry = inject(CustomRegistryService);
  protected _planApiService = inject(PlansService);
  protected readonly registryType = CustomRegistryType.ARTEFACT;

  readonly availableArtefacts$ = this._planApiService.getArtefactTypes().pipe(
    map((artefactNames) => {
      return artefactNames
        .map((artefactName) => this.getArtefactType(artefactName))
        .filter((artefact) => !!artefact?.isSelectable);
    }),
  );

  readonly defaultIcon = 'check_box_outline_blank';

  register(typeName: string, artefactType: Partial<ArtefactType>): void {
    if (!artefactType.type) {
      artefactType.type = typeName;
    }
    if (!artefactType.label) {
      artefactType.label = typeName;
    }
    if (!artefactType.description) {
      artefactType.description = '';
    }
    if (!('isSelectable' in artefactType)) {
      artefactType.isSelectable = true;
    }
    this._customRegistry.register(this.registryType, typeName, artefactType as ArtefactType);
  }

  getArtefactType(typeName?: string): ArtefactType | undefined {
    if (!typeName) {
      return undefined;
    }
    const item = this._customRegistry.getRegisteredItem(this.registryType, typeName);
    return item as ArtefactType;
  }

  isDynamicValue(value: ArtefactFieldValue): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }
    return value.hasOwnProperty('dynamic') && (value.hasOwnProperty('value') || value.hasOwnProperty('expression'));
  }

  convertDynamicValue(
    value?: DynamicValueString | DynamicValueInteger | DynamicValueBoolean,
  ): string | number | boolean | undefined {
    if (!value) {
      return undefined;
    }
    if (value.dynamic) {
      return value.expression;
    }
    let result = value.value;
    if (!result) {
      return result;
    }
    if (typeof result === 'object') {
      result = JSON.stringify(result);
    }
    return result;
  }

  convertTimeDynamicValue(value: DynamicValueInteger, unit: TimeUnitDictKey = 'ms', allowedUnits?: TimeUnit[]): string {
    if (value.dynamic) {
      return `${value.expression}${unit}`;
    }
    allowedUnits = allowedUnits ?? Object.values(TIME_UNIT_DICTIONARY);
    const measure = TIME_UNIT_DICTIONARY[unit] as TimeUnit;
    const newMeasure = this._timeConverter.autoDetermineDisplayMeasure(value.value ?? 0, measure, allowedUnits);
    const converted = this._timeConverter.calculateDisplayValue(value?.value ?? 0, measure, newMeasure);
    const newUnit = TIME_UNIT_LABELS[newMeasure] as TimeUnitDictKey;
    return `${converted}${newUnit}`;
  }
}
