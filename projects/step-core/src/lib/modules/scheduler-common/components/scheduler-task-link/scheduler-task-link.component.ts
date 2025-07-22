import { Component, Input } from '@angular/core';
import { ExecutiontTaskParameters } from '../../../../client/step-client-module';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.constant';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { LinkDisplayType } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
  imports: [SCHEDULER_COMMON_IMPORTS],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  @Input() context?: ExecutiontTaskParameters;
  readonly LinkDisplayType = LinkDisplayType;
  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;
}
