/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExecutiontTaskParameters } from './ExecutiontTaskParameters';
import type { MonitoringDashboardConfigurationEntry } from './MonitoringDashboardConfigurationEntry';

export type SchedulerTasksAndConfiguration = {
    schedulerTask?: ExecutiontTaskParameters;
    configuration?: MonitoringDashboardConfigurationEntry;
};

