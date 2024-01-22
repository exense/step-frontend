import { FormBuilder, Validators } from '@angular/forms';
import { ChartSettings } from '@exense/step-core';

export type ChartSettingsForm = ReturnType<typeof createChartSettingsGroup>;

export const createChartSettingsGroup = (fb: FormBuilder, settings: ChartSettings) => {
  return fb.group({
    metricKey: fb.control(settings.metricKey, [Validators.required]),
    attributes: fb.control(settings.attributes, [Validators.required]),
    primaryAxes: fb.control(settings.primaryAxes, [Validators.required]),
    filters: fb.control(settings.filters, [Validators.required]),
    grouping: fb.control(settings.grouping, [Validators.required]),
    inheritGlobalFilters: fb.control(settings.inheritGlobalFilters, [Validators.required]),
    inheritGlobalGrouping: fb.control(settings.inheritGlobalGrouping, [Validators.required]),
    readonlyGrouping: fb.control(settings.readonlyGrouping, [Validators.required]),
    readonlyAggregate: fb.control(settings.readonlyAggregate, [Validators.required]),
  });
};
