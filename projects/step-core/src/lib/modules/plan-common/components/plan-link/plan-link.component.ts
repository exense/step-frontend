import { Component, inject, Input } from '@angular/core';
import { map, of } from 'rxjs';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../../table/table.module';
import { StepBasicsModule, LinkDisplayType } from '../../../basics/step-basics.module';
import { Plan } from '../../../../client/step-client-module';
import { PlanUrlPipe } from '../../pipes/plan-url.pipe';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
  imports: [StepBasicsModule, PlanUrlPipe],
})
export class PlanLinkComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  @Input() context?: Plan;
  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;

  readonly LinkDisplayType = LinkDisplayType;

  readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));
}
