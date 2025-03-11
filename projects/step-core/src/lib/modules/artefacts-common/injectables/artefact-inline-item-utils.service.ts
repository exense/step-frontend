import { inject, Injectable } from '@angular/core';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
  ReportNode,
} from '../../../client/step-client-module';
import { AggregatedArtefactInfo, ReportNodeWithArtefact } from '../types/artefact-types';
import { ArtefactInlineItem } from '../types/artefact-inline-item';
import { ArtefactService } from './artefact.service';
import { TimeUnitDictKey } from '../../basics/types/time-unit.enum';

type DynamicValue = DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
type PossibleValue = string | number | boolean | DynamicValue | undefined;

export interface ArtefactInlineItemConfig {
  label?: PossibleValue;
  labelTooltip?: string;
  value?: PossibleValue;
  valueTooltip?: string;
  icon?: string;
  iconTooltip?: string;
  timeValueUnit?: TimeUnitDictKey;
  isValueFirst?: boolean;
  prefix?: string;
  suffix?: string;
}

export type ArtefactInlineItemSource = (
  | [PossibleValue, PossibleValue]
  | [PossibleValue, PossibleValue, string | undefined]
  | [PossibleValue, PossibleValue, string | undefined, string | undefined]
  | ArtefactInlineItemConfig
)[];

@Injectable({
  providedIn: 'root',
})
export class ArtefactInlineItemUtilsService {
  private _artefactService = inject(ArtefactService);

  isAggregatedArtefactResolved<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>>(
    info?: AggregatedArtefactInfo<A, R>,
  ): boolean {
    if (!info) {
      return false;
    }

    const statuses = new Set(Object.keys(info.countByStatus ?? {}));
    if (statuses.has('RUNNING')) {
      return false;
    }

    return true;
  }

  convert(items: ArtefactInlineItemSource, isResolved?: boolean): ArtefactInlineItem[] {
    return items.map((itemConfig) => {
      let config: ArtefactInlineItemConfig;
      if (itemConfig instanceof Array) {
        const [label, value, icon, iconTooltip] = itemConfig;
        config = { label, value, icon, iconTooltip };
      } else {
        config = itemConfig;
      }

      const label = this.prepareDynamicValue(config.label);
      const value =
        !!config.timeValueUnit && this._artefactService.isDynamicValue(config.value)
          ? this.prepareTimeValue(config.value as DynamicValueInteger, config.timeValueUnit)
          : this.prepareDynamicValue(config.value);

      const { icon, iconTooltip, isValueFirst, prefix, suffix, labelTooltip, valueTooltip } = config;

      return {
        label,
        labelTooltip,
        value,
        valueTooltip,
        icon,
        iconTooltip,
        isValueFirst,
        prefix,
        suffix,
      };
    });
  }

  private prepareDynamicValue(value: PossibleValue): DynamicValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const isDynamic = this._artefactService.isDynamicValue(value);
    if (isDynamic) {
      return value as DynamicValue;
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return {
      value: value as string | number | boolean,
      dynamic: false,
    };
  }

  private prepareTimeValue(time: DynamicValueInteger, initialUnit?: TimeUnitDictKey): DynamicValue | undefined {
    if (!time) {
      return { value: undefined };
    }
    const { value, unit } = this._artefactService.convertTimeDynamicValue(time, initialUnit);
    if (time.dynamic) {
      return {
        expression: `${value} ${unit}`,
        dynamic: true,
      };
    }
    return {
      value: `${value}${unit}`,
      dynamic: false,
    };
  }
}
