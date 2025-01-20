import { ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailedValueDialogComponent } from '../detailed-value-dialog/detailed-value-dialog.component';

@Component({
  selector: 'step-detailed-value',
  standalone: true,
  imports: [],
  templateUrl: './detailed-value.component.html',
  styleUrl: './detailed-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedValueComponent {
  private _matDialog = inject(MatDialog);

  private valueContainer = viewChild<ElementRef<HTMLDivElement>>('valueContainer');

  readonly value = input.required<string>();

  protected openDetailedInfo($event: MouseEvent): void {
    const valueContainer = this.valueContainer()?.nativeElement;
    if (!valueContainer || valueContainer.getBoundingClientRect().height < 80) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    const value = this.value();
    this._matDialog.open(DetailedValueDialogComponent, { data: value });
  }
}
