import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Plan } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../modules/table/table.module';
import { a1Promise2Observable, AJS_LOCATION, DialogsService } from '../../shared';
import { MultipleProjectsService } from '../../modules/basics/services/multiple-projects.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
})
export class PlanLinkComponent implements CustomComponent {
  private _location = inject(AJS_LOCATION);
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private _multipleProjects = inject(MultipleProjectsService);
  private _dialogs = inject(DialogsService);

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

    const planUrl = `/root/plans/editor/${this.context!.id}`;

    if (this._multipleProjects.isEntityBelongsToCurrentProject(this.context)) {
      this.edit.emit();
      this._location.path(planUrl);
      return;
    }

    a1Promise2Observable(this._dialogs.showWarning('Selected plan belongs to another project, do you want to switch?'))
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
      .subscribe((isSwitch) => {
        if (!isSwitch) {
          return;
        }
        const project = this._multipleProjects.getEntityProject(this.context!);
        if (!project) {
          return;
        }
        this._multipleProjects.switchToProject(project, planUrl);
      });
  }
}
