import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Plan } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../modules/table/table.module';
import { PlanLinkDialogService } from './plan-link-dialog.service';
import { LinkDisplayType } from '../../shared';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
})
export class PlanLinkComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private _planDialogs = inject(PlanLinkDialogService, { optional: true });
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  @Input() context?: Plan;
  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;
  @Output() edit = new EventEmitter<void>();

  readonly LinkDisplayType = LinkDisplayType;

  readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));

  editPlan(): void {
    if (!this.context || !this._planDialogs) {
      return;
    }
    this._planDialogs.editPlan(this.context).subscribe((continueEdit) => {
      if (continueEdit) {
        this.edit.emit();
      }
    });
  }
}
