import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DashboardsService, DashboardView, DialogRouteResult } from '@exense/step-core';
import { MatDialogRef } from '@angular/material/dialog';
import { DashboardNavigatorService } from '../../injectables/dashboard-navigator.service';
import { COMMON_IMPORTS } from '../../modules/_common';

type DialogRef = MatDialogRef<NewDashboardDialogComponent, DialogRouteResult>;
type FormValue = NewDashboardDialogComponent['form']['value'];

@Component({
  selector: 'step-new-dashboard-dialog',
  templateUrl: './new-dashboard-dialog.component.html',
  styleUrls: ['./new-dashboard-dialog.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class NewDashboardDialogComponent {
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  private _dashboardsService = inject(DashboardsService);
  private _dashboardNavigator = inject(DashboardNavigatorService);

  readonly form = this._fb.group({
    name: this._fb.control('', Validators.required),
    description: this._fb.control(''),
  });

  private createEmptyDashboardObject(formValue: FormValue): DashboardView {
    const { name, description } = formValue;
    return {
      name: name!,
      description,
      timeRange: { type: 'RELATIVE', relativeSelection: { timeInMs: 3600_000 } },
      grouping: [],
      filters: [],
      dashlets: [],
    };
  }

  save(isEditAfterSave: boolean = false): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dashboard = this.createEmptyDashboardObject(this.form.value);
    this._dashboardsService.saveDashboard(dashboard).subscribe((dashboard) => {
      const isSuccess = !!dashboard;
      const canNavigateBack = !isEditAfterSave;
      if (isEditAfterSave) {
        this._dashboardNavigator.navigateToDashboard(dashboard, true);
      }
      this._dialogRef.close({ isSuccess, canNavigateBack });
    });
  }

  @HostListener('keydown.enter')
  private handleSaveByEnter(): void {
    this.save(true);
  }
}
