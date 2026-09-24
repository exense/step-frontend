import { Component, inject, Input } from '@angular/core';
import { map, of } from 'rxjs';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../../table/table.module';
import { StepBasicsModule, LinkDisplayType, IDE_MODE } from '../../../basics/step-basics.module';
import { Plan } from '../../../../client/step-client-module';
import { PlanUrlPipe } from '../../pipes/plan-url.pipe';
import { isAiGeneratedEntity } from '../../types/entity-origin';
import { AiGeneratedBadgeComponent } from '../ai-generated-badge/ai-generated-badge.component';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
  imports: [StepBasicsModule, PlanUrlPipe, AiGeneratedBadgeComponent],
})
export class PlanLinkComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private readonly _isIdeMode = inject(IDE_MODE);
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  @Input() context?: Plan;
  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;

  readonly LinkDisplayType = LinkDisplayType;

  readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));

  get showAiGeneratedBadge(): boolean {
    return this._isIdeMode && this.linkDisplayType !== LinkDisplayType.ICON_ONLY && isAiGeneratedEntity(this.context);
  }
}
