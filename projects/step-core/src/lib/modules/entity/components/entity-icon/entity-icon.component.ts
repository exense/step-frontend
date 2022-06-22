import { Component, Input } from '@angular/core';
import { EntityScopeResolver } from '../../services/entity-scope-resolver';
import { Entity } from '../../types/entity';
import { EntityRegistry } from '../../services/entity-registry';

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

  ngOnChanges(): void {
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
