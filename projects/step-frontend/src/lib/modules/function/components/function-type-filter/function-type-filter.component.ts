import { Component, Inject, OnInit } from '@angular/core';
import { AJS_FUNCTION_TYPE_REGISTRY, ArrayFilterComponent } from '@exense/step-core';

@Component({
  selector: 'step-function-type-filter',
  templateUrl: './function-type-filter.component.html',
  styleUrls: ['./function-type-filter.component.scss'],
})
export class FunctionTypeFilterComponent extends ArrayFilterComponent implements OnInit {
  constructor(@Inject(AJS_FUNCTION_TYPE_REGISTRY) private _functionTypeRegistry: any) {
    super();
  }

  functionTypes: { key: string; value: string }[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    const keys = this._functionTypeRegistry.getTypes() as string[];
    this.functionTypes = keys.map((key) => {
      const value = this._functionTypeRegistry.getLabel(key);
      return { key, value };
    });
  }
}
