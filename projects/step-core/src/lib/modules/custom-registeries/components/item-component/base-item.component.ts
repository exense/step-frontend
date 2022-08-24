import { Component, Input, OnChanges, SimpleChanges, Type } from '@angular/core';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { CustomRegistryItem } from '../../shared/custom-registry-item';
import { Mutable } from '../../../../shared';
import { CustomRegistryService } from '../../services/custom-registry.service';
import { CustomComponent } from '../../shared/custom-component';

type FieldAccessor = Mutable<Pick<BaseItemComponent<any>, 'component'>>;

@Component({
  template: '',
})
export abstract class BaseItemComponent<T extends CustomRegistryItem> implements OnChanges {
  readonly component?: Type<CustomComponent>;

  protected abstract readonly registryType: CustomRegistryType;

  @Input() itemKey?: string;
  @Input() context?: any;

  protected constructor(private _customRegistryService: CustomRegistryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cItemKey = changes['itemKey'];
    if (cItemKey?.previousValue != cItemKey?.currentValue && cItemKey?.firstChange) {
      this.onKeyUpdate(cItemKey?.currentValue);
    }
  }

  private onKeyUpdate(itemKey?: string): void {
    if (!itemKey) {
      (this as FieldAccessor).component = undefined;
      return;
    }

    const item = this._customRegistryService.getRegisteredItem(this.registryType, itemKey) as T;
    (this as FieldAccessor).component = !item ? undefined : this.resolveComponent(item);
  }

  protected resolveComponent(item: T): Type<CustomComponent> | undefined {
    return item.component;
  }
}
