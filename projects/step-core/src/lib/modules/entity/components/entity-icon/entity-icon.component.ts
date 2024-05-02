import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { EntityTypeResolver } from '../../injectables/entity-type-resolver';
import { Entity } from '../../types/entity';
import { EntityRegistry } from '../../injectables/entity-registry';

import { AugmentedPlansService } from '../../../../client/augmented/services/augmented-plans.service';
import { Plan } from '../../../../client/generated';
import { ArtefactService } from '../../../../services/artefact.service';

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

  private _entityTypeResolver = inject(EntityTypeResolver);
  private entityRegistry = inject(EntityRegistry);
  private _artefactService = inject(ArtefactService);

  constructor() {}

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
    let iconOverride = this._entityTypeResolver.getTypeExtension(this.entity, entityType);

    if (entityType?.type === AugmentedPlansService.PLANS_TABLE_ID) {
      if (!iconOverride?.icon) {
        const planEntity = this.entity as Plan;
        const planTypeIcon = this._artefactService.getArtefactType(planEntity.root?._class)?.icon;
        iconOverride = { icon: planTypeIcon };
      }
    }

    return { icon: iconOverride?.icon ?? entityType?.icon ?? '', tooltip: iconOverride?.tooltip ?? '' };
  }
}
