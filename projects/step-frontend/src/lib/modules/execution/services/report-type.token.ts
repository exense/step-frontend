import { ReportLayout } from '@exense/step-core';
import { InjectionToken } from '@angular/core';

type ReportType = ReportLayout['reportType'];

export const REPORT_TYPE = new InjectionToken<ReportType>('Report type');
