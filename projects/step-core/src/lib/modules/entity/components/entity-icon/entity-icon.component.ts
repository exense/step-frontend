import { Component, Input, SimpleChanges } from '@angular/core';
import { EntityScopeResolver } from '../../services/entity-scope-resolver';
import { Entity } from '../../types/entity';
import { EntityRegistry } from '../../services/entity-registry';

import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../../shared';

@Component({
  selector: 'entity-icon',
  templateUrl: './entity-icon.component.html',
  styleUrls: ['./entity-icon.component.scss'],
})
export class EntityIconComponent {
  @Input() entityName?: string;
  @Input() entity!: Entity;

  icon?: string;
  tooltip?: string;

  constructor(private entityScopeResolver: EntityScopeResolver, private entityRegistry: EntityRegistry) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['entity'].previousValue !== changes['entity'].currentValue ||
      changes['entityName']?.previousValue !== changes['entityName']?.currentValue
    ) {
      this.update();
    }
  }

  update(): void {
    this.icon = 'adjust';
    this.tooltip = 'In this project';

    const entityScope = this.entityScopeResolver.getScope(this.entity);
    if (entityScope) {
      this.icon = entityScope.icon;
      this.tooltip = entityScope.tooltip;
    } else {
      if (!this.entityName) {
        return;
      }
      const entityType = this.entityRegistry.getEntityByName(this.entityName);
      console.log('entityType', entityType);
      console.log('entityName', this.entityName);

      if (entityType && entityType.iconAG2) {
        this.icon = entityType.iconAG2;
      }
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('entityIcon', downgradeComponent({ component: EntityIconComponent }));
