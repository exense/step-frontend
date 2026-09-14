import { Component, inject, input, Input } from '@angular/core';
import { map, of } from 'rxjs';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../../table/table.module';
import { StepBasicsModule, LinkDisplayType, IDE_MODE } from '../../../basics/step-basics.module';
import { Plan } from '../../../../client/step-client-module';
import { PlanUrlPipe } from '../../pipes/plan-url.pipe';
import { ENTITY_ORIGIN_AI, ENTITY_ORIGIN_CUSTOM_FIELD } from '../../types/entity-origin';
import { AiGeneratedBadgeComponent } from '../ai-generated-badge/ai-generated-badge.component';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
  imports: [StepBasicsModule, PlanUrlPipe, AiGeneratedBadgeComponent],
})
export class PlanLinkComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  protected readonly _isIdeMode = inject(IDE_MODE);
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- CustomComponent renderers assign context directly.
  @Input() context?: Plan;
  readonly linkDisplayType = input(LinkDisplayType.TEXT_ONLY);

  protected readonly LinkDisplayType = LinkDisplayType;
  protected readonly ENTITY_ORIGIN_AI = ENTITY_ORIGIN_AI;
  protected readonly ENTITY_ORIGIN_CUSTOM_FIELD = ENTITY_ORIGIN_CUSTOM_FIELD;

  protected readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  protected readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));
}
