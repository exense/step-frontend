import { inject, InjectionToken, Provider } from '@angular/core';

export interface StepDateFormatConfig {
  formatDate?: string;
  formatTime?: string;
  dateTimeDelimiter?: string;
}

const DEFAULT_CONFIG: StepDateFormatConfig = {
  formatDate: 'dd.MM.yyyy',
  formatTime: 'HH:mm:ss',
  dateTimeDelimiter: ' ',
};
export const STEP_DATE_FORMAT_CONFIG = new InjectionToken<StepDateFormatConfig>('Date picker format configuration');

export const STEP_FORMAT_DATE = new InjectionToken<string>('Date format');
export const STEP_FORMAT_TIME = new InjectionToken<string>('Time format');
export const STEP_DATE_TIME_DELIMITER = new InjectionToken<string>('Date time delimiter');

export const STEP_DATE_TIME_FORMAT_PROVIDERS: Provider[] = [
  {
    provide: STEP_FORMAT_DATE,
    useFactory: () => {
      const config = inject(STEP_DATE_FORMAT_CONFIG, { optional: true });
      return config?.formatDate ?? DEFAULT_CONFIG.formatDate;
    },
  },
  {
    provide: STEP_FORMAT_TIME,
    useFactory: () => {
      const config = inject(STEP_DATE_FORMAT_CONFIG, { optional: true });
      return config?.formatTime ?? DEFAULT_CONFIG.formatTime;
    },
  },
  {
    provide: STEP_DATE_TIME_DELIMITER,
    useFactory: () => {
      const config = inject(STEP_DATE_FORMAT_CONFIG, { optional: true });
      return config?.dateTimeDelimiter ?? DEFAULT_CONFIG.dateTimeDelimiter;
    },
  },
];
