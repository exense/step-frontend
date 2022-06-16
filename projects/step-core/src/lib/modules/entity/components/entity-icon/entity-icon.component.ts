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
  @Input() entityName: string = '';
  @Input() entity!: Entity;

  icon?: string;
  tooltip?: string;

  constructor(private entityScopeResolver: EntityScopeResolver, private entityRegistry: EntityRegistry) {}

  ngOnInit(): void {
    console.log('ngOnInit');

    console.log('this.entity', this.entity);
    this.icon = 'public';
    const entityScope = this.entityScopeResolver.getScope(this.entity);
    if (entityScope) {
      this.icon = entityScope.icon;
      this.tooltip = entityScope.tooltip;
    } else {
      const entityType = this.entityRegistry.getEntityByName(this.entityName);
      if (entityType && entityType.icon) {
        this.icon = entityType.icon;
        this.tooltip = '';
      }
    }
  }
}
