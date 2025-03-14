import { inject, Injectable } from '@angular/core';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../client/step-client-module';
import { ArtefactInlineItem, ArtefactInlineItemsResolvableField } from '../types/artefact-inline-item';
import { ArtefactService } from './artefact.service';
import { TimeUnitDictKey } from '../../basics/types/time-unit.enum';

type DynamicValue = DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
type PossibleValue = string | number | boolean | DynamicValue | undefined;

export interface ArtefactInlineItemConfig {
  label?: PossibleValue;
  labelTooltip?: string;
  labelExplicitExpression?: string;
  value?: PossibleValue;
  valueTooltip?: string;
  valueExplicitExpression?: string;
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

  convert(items: ArtefactInlineItemSource): ArtefactInlineItem[] {
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

      if (label) {
        label.tooltip = labelTooltip;
        if (config.labelExplicitExpression) {
          label.expression = config.labelExplicitExpression;
        }
      }

      if (value) {
        value.tooltip = valueTooltip;
        if (config.valueExplicitExpression) {
          value.expression = config.valueExplicitExpression;
        }
      }

      return {
        label,
        value,
        icon,
        iconTooltip,
        isValueFirst,
        prefix,
        suffix,
      };
    });
  }

  private prepareDynamicValue(value: PossibleValue): ArtefactInlineItemsResolvableField | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const isDynamic = this._artefactService.isDynamicValue(value);
    if (isDynamic) {
      const dynamicValue = value as DynamicValue;
      if (dynamicValue.dynamic) {
        return {
          value: dynamicValue.expression,
          expression: dynamicValue.expression,
          isResolved: false,
        };
      }
      return {
        value: dynamicValue.value,
        isResolved: true,
      };
    }
    return {
      value: value as string | number | boolean | object,
      isResolved: true,
    };
  }

  private prepareTimeValue(
    time: DynamicValueInteger,
    initialUnit?: TimeUnitDictKey,
  ): ArtefactInlineItemsResolvableField | undefined {
    if (!time) {
      return undefined;
    }
    const { value, unit } = this._artefactService.convertTimeDynamicValue(time, initialUnit);
    if (time.dynamic) {
      return {
        expression: `${value} ${unit}`,
        value: `${value} ${unit}`,
        isResolved: false,
      };
    }
    return {
      value: `${value}${unit}`,
      isResolved: true,
    };
  }
}
