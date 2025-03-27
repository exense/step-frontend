import { FormBuilder, FormControl } from '@angular/forms';
import { inject, Injectable } from '@angular/core';

export abstract class SelectComponentSearchCtrlContainer {
  abstract readonly searchControl: FormControl<string>;
}

@Injectable()
export class SelectComponentSearchCtrlContainerDefaultImpl implements SelectComponentSearchCtrlContainer {
  private _fb = inject(FormBuilder).nonNullable;
  readonly searchControl = this._fb.control('');
}
