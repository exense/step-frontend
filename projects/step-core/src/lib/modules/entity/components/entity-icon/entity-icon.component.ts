import { Component, Input, SimpleChanges } from '@angular/core';
import { EntityTypeResolver } from '../../services/entity-type-resolver';
import { Entity } from '../../types/entity';
import { EntityRegistry } from '../../services/entity-registry';

import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../../shared';

@Component({
  selector: 'entity-icon', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './entity-icon.component.html',
  styleUrls: ['./entity-icon.component.scss'],
})
export class EntityIconComponent {
  @Input() entityName?: string;
  @Input() entity!: Entity;

  icon: string = '';
  tooltip: string = '';

  constructor(private _entityTypeResolver: EntityTypeResolver, private entityRegistry: EntityRegistry) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['entity'].firstChange ||
      changes['entityName']?.firstChange ||
      changes['entity'].previousValue !== changes['entity'].currentValue ||
      changes['entityName']?.previousValue !== changes['entityName']?.currentValue
    ) {
      this.update();
    }
  }

  update(): void {
    const iconType = this.getIconType();
    this.icon = iconType.icon;
    this.tooltip = iconType.tooltip;
  }

  private getIconType(): { icon: string; tooltip: string } {
    const entityType = this.entityName ? this.entityRegistry.getEntityByName(this.entityName) : undefined;
    const entityTypeExtension = this._entityTypeResolver.getTypeExtension(this.entity, entityType);

    if (entityTypeExtension) {
      return { icon: entityTypeExtension.icon, tooltip: entityTypeExtension.tooltip ?? '' };
    }

    if (entityType) {
      return { icon: entityTypeExtension.icon ?? '', tooltip: '' };
    }

    console.warn('getIconType: no icon type available');
    return { icon: '', tooltip: '' };
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('entityIcon', downgradeComponent({ component: EntityIconComponent }));
