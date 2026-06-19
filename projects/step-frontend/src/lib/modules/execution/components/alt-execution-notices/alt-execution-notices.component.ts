import { ChangeDetectionStrategy, Component, computed, inject, input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResolvedExecutionNotice } from '@exense/step-core';
import {
  AltExecutionNoticesDialogComponent,
  AltExecutionNoticesDialogData,
} from '../alt-execution-notices-dialog/alt-execution-notices-dialog.component';

@Component({
  selector: 'step-alt-execution-notices',
  templateUrl: './alt-execution-notices.component.html',
  styleUrl: './alt-execution-notices.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionNoticesComponent {
  private _dialog = inject(MatDialog);
  private _viewContainerRef = inject(ViewContainerRef);

  readonly notices = input<ResolvedExecutionNotice[] | undefined | null>();

  protected readonly firstNotice = computed(() => this.notices()?.[0]);
  protected readonly totalCount = computed(() => this.notices()?.length ?? 0);

  protected showAll(): void {
    const notices = this.notices() ?? [];
    if (!notices.length) {
      return;
    }
    this._dialog.open(AltExecutionNoticesDialogComponent, {
      data: { notices } as AltExecutionNoticesDialogData,
      viewContainerRef: this._viewContainerRef,
    });
  }
}
