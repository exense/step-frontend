import { StepBasicsModule } from '../../basics/step-basics.module';
import { CronModule } from '../../cron/cron.module';
import { CustomRegistriesModule } from '../../custom-registeries/custom-registries.module';
import { TaskUrlPipe } from '../pipes/task-url.pipe';

export const SCHEDULER_COMMON_IMPORTS = [StepBasicsModule, CronModule, CustomRegistriesModule, TaskUrlPipe];
