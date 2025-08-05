import { Component, inject, Input, OnChanges, SimpleChanges, Type, ViewChild } from '@angular/core';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { CustomRegistryItem } from '../../shared/custom-registry-item';
import { CustomRegistryService } from '../../services/custom-registry.service';
import { CustomComponent } from '../../shared/custom-component';
import { CustomItemRenderComponent } from '../custom-item-render/custom-item-render.component';
import { Mutable } from '../../../basics/types/mutable';

type FieldAccessor = Mutable<Pick<BaseItemComponent<any>, 'component'>>;

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseItemComponent<T extends CustomRegistryItem> implements OnChanges {
  protected _customRegistryService = inject(CustomRegistryService);
  readonly component?: Type<CustomComponent>;

  protected abstract readonly registryType: CustomRegistryType;

  @Input() itemKey?: string;
  @Input() context?: any;

  @ViewChild('renderer', { static: true })
  private renderer!: CustomItemRenderComponent;

  get componentInstance(): CustomComponent | undefined {
    return this.renderer.componentInstance;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItemKey = changes['itemKey'];
    if (cItemKey?.previousValue !== cItemKey?.currentValue || cItemKey?.firstChange) {
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
