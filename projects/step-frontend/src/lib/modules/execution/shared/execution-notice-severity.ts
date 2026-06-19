import { AlertType, ExecutionNoticeSeverity } from '@exense/step-core';

export const EXECUTION_NOTICE_ALERT_TYPE: Record<ExecutionNoticeSeverity, AlertType> = {
  INFO: AlertType.INFO,
  WARNING: AlertType.WARNING,
  ERROR: AlertType.DANGER,
};

export const EXECUTION_NOTICE_ICON: Record<ExecutionNoticeSeverity, string> = {
  INFO: 'info',
  WARNING: 'alert-triangle',
  ERROR: 'alert-octagon',
};
