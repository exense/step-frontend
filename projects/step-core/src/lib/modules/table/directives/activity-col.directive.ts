import { Directive, inject, input } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { ColumnInfo } from '../types/column-info';

@Directive({
  selector: '[matColumnDef][stepActivityCol]',
  standalone: false,
})
export class ActivityColDirective {
  private matColumnDef = inject(MatColumnDef, { host: true });

  caption = input('', { alias: 'stepActivityCol' });
  canHide = input(true);
  isHiddenByDefault = input(false);

  columnInfo(): ColumnInfo {
    return {
      columnId: this.matColumnDef?.name,
      caption: this.caption() ?? this.matColumnDef?.name,
      canHide: this.canHide(),
      isHiddenByDefault: this.canHide() && this.isHiddenByDefault(),
    };
  }
}
