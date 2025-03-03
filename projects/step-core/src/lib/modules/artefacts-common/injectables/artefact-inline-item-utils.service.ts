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

type DynamicValue = DynamicValueString | DynamicValueInteger | DynamicValueBoolean;
type PossibleValue = string | number | boolean | DynamicValue | undefined;
export type ArtefactInlineItemSource = (
  | [PossibleValue, PossibleValue]
  | [PossibleValue, PossibleValue, string]
  | [PossibleValue, PossibleValue, string, string]
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
    return items.map(([itemLabel, itemValue, icon, iconTooltip]) => {
      const { value: label, isResolved: isLabelResolved } = this.prepareDynamicValue(itemLabel, isResolved);
      const { value, isResolved: isValueResolved } = this.prepareDynamicValue(itemValue, isResolved);

      return {
        label: label!,
        isLabelResolved,
        value,
        isValueResolved,
        icon,
        iconTooltip,
      };
    });
  }

  private prepareDynamicValue(
    value: PossibleValue,
    isResolved?: boolean,
  ): { value: DynamicValue | undefined; isResolved?: boolean } {
    if (!value) {
      return { value: value as undefined, isResolved: true };
    }
    const isDynamic = this._artefactService.isDynamicValue(value);
    if (isDynamic) {
      return { value: value as DynamicValue, isResolved };
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
}
