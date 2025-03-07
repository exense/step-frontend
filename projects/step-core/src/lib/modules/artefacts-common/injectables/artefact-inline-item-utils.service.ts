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
  itemLabel?: PossibleValue;
  itemValue?: PossibleValue;
  icon?: string;
  iconTooltip?: string;
  itemTimeValueUnit?: TimeUnitDictKey;
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
        const [itemLabel, itemValue, icon, iconTooltip] = itemConfig;
        config = { itemLabel, itemValue, icon, iconTooltip };
      } else {
        config = itemConfig;
      }

      const { value: label, isResolved: isLabelResolved } = this.prepareDynamicValue(config.itemLabel, isResolved);
      const { value, isResolved: isValueResolved } =
        !!config.itemTimeValueUnit && this._artefactService.isDynamicValue(config.itemValue)
          ? this.prepareTimeValue(config.itemValue as DynamicValueInteger, config.itemTimeValueUnit)
          : this.prepareDynamicValue(config.itemValue, isResolved);

      const { icon, iconTooltip, isValueFirst, prefix, suffix } = config;

      return {
        label,
        isLabelResolved,
        value,
        isValueResolved,
        icon,
        iconTooltip,
        isValueFirst,
        prefix,
        suffix,
      };
    });
  }

  private prepareDynamicValue(
    value: PossibleValue,
    isResolved?: boolean,
  ): { value: DynamicValue | undefined; isResolved?: boolean } {
    if (value === null || value === undefined) {
      return { value: value as undefined, isResolved: true };
    }
    const isDynamic = this._artefactService.isDynamicValue(value);
    if (isDynamic) {
      return { value: value as DynamicValue, isResolved: true };
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return {
      value: {
        value: value as string | number | boolean,
        dynamic: false,
      },
      isResolved: true,
    };
  }

  private prepareTimeValue(
    time: DynamicValueInteger,
    initialUnit?: TimeUnitDictKey,
  ): { value: DynamicValue | undefined; isResolved?: boolean } {
    if (!time) {
      return { value: undefined, isResolved: true };
    }
    const { value, unit } = this._artefactService.convertTimeDynamicValue(time, initialUnit);
    if (time.dynamic) {
      return {
        value: {
          expression: `${value} ${unit}`,
          dynamic: true,
        },
        isResolved: true,
      };
    }
    return {
      value: {
        value: `${value}${unit}`,
        dynamic: false,
      },
      isResolved: true,
    };
  }
}
