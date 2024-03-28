import { Directive, inject, Input } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { KeyValue } from '@angular/common';

@Directive({
  selector: '[matColumnDef][stepColumnDefLabel]',
})
export class ColumnDefLabelDirective {
  private matColumnDef = inject(MatColumnDef, { host: true });

  @Input('stepColumnDefLabel') columnLabel?: string;

  getColumnIdAndLabel(): KeyValue<string, string | undefined> {
    return {
      key: this.matColumnDef.name,
      value: this.columnLabel,
    };
  }
}
