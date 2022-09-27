import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[stepAdditionalHeader]',
})
export class AdditionalHeaderDirective {
  private _headerGroupId?: string;
  @Input()
  set stepAdditionalHeader(value: string) {
    this._headerGroupId = value;
  }

  get headerGroupId(): string | undefined {
    return this._headerGroupId;
  }
  set headerGroupId(value) {
    this._headerGroupId = value;
  }

  constructor(public template: TemplateRef<any>) {}
}
