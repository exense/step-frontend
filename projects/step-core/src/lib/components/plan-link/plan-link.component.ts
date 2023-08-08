import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Plan } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../modules/table/table.module';
import { PlanDialogsService } from '../../services/plan-dialogs.service';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
})
export class PlanLinkComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private _planDialogs = inject(PlanDialogsService);

  @Input() context?: Plan;
  @Input() iconOnly?: boolean;
  @Output() edit = new EventEmitter<void>();

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  editPlan(): void {
    if (!this.context) {
      return;
    }
    this._planDialogs.editPlan(this.context).subscribe((continueEdit) => {
      this.edit.emit();
    });
  }
}
