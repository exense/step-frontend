import { ExecutiontTaskParameters } from '../../../client/step-client-module';
export abstract class ScheduledTaskUrlService {
  abstract schedulerTaskUrl(idOrTask?: string | ExecutiontTaskParameters): string;
}
