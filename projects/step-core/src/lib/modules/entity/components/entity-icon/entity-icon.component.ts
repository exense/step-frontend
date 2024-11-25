import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { EntityTypeResolver } from '../../injectables/entity-type-resolver';
import { Entity } from '../../types/entity';
import { EntityRegistry } from '../../injectables/entity-registry';

import { AugmentedPlansService, Plan } from '../../../../client/step-client-module';
import { ArtefactService } from '../../../../services/artefact.service';

@Component({
  selector: 'entity-icon', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './entity-icon.component.html',
  styleUrls: ['./entity-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EntityIconComponent {
  private _entityTypeResolver = inject(EntityTypeResolver);
  private _entityRegistry = inject(EntityRegistry);
  private _artefactService = inject(ArtefactService);

  /** @Input() **/
  readonly entityName = input<string>();

  /** @Input() **/
  readonly entity = input.required<Entity>();

  protected readonly iconInfo = computed(() => {
    const entityName = this.entityName();
    const entity = this.entity();

    const entityType = entityName ? this._entityRegistry.getEntityByName(entityName) : undefined;
    let iconOverride = this._entityTypeResolver.getTypeExtension(entity, entityType);

    if (entityType?.type === AugmentedPlansService.PLANS_TABLE_ID) {
      if (!iconOverride?.icon) {
        const planEntity = entity as Plan;
        const planTypeIcon = this._artefactService.getArtefactType(planEntity.root?._class)?.icon;
        iconOverride = { icon: planTypeIcon };
      }
    }

    return { icon: iconOverride?.icon ?? entityType?.icon ?? '', tooltip: iconOverride?.tooltip ?? '' };
  });
}
