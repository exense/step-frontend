import { Directive, Input, Self } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';

@Directive({
  selector: '[matColumnDef][stepSearchCol]',
})
export class SearchColDirective {
  constructor(@Self() private _matColumnDef: MatColumnDef) {}

  @Input('stepSearchCol') searchCol?: string;

  get searchColumnName(): string {
    return this.searchCol || this._matColumnDef.name;
  }
}
