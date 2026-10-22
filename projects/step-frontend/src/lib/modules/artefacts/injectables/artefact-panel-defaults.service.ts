import { Injectable } from '@angular/core';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '@exense/step-core';

type PanelField = DynamicValueString | DynamicValueBoolean | DynamicValueInteger;
type NullableField<T extends PanelField> = Omit<T, 'value'> & { value?: T['value'] | null };

@Injectable({ providedIn: 'root' })
export class ArtefactPanelDefaultsService {
  isNonDefault(field: NullableField<PanelField> | null | undefined, defaultValue: string | boolean | number): boolean {
    if (field?.dynamic === true) {
      return true;
    }
    const value = field?.value;
    if (value === undefined || value === null) {
      return false;
    }
    return value !== defaultValue;
  }

  hasTokenSelectors(field: NullableField<DynamicValueString> | null | undefined): boolean {
    if (field?.dynamic === true) {
      return true;
    }
    const value = field?.value;
    if (value === undefined || value === null || !value.trim()) {
      return false;
    }
    try {
      const selectors: unknown = JSON.parse(value);
      return (
        selectors === null ||
        typeof selectors !== 'object' ||
        Array.isArray(selectors) ||
        Object.keys(selectors).length > 0
      );
    } catch {
      return true;
    }
  }
}
