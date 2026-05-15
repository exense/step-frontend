import { Component, computed, forwardRef, input } from '@angular/core';
import { CustomColumnsBaseComponent, BaseColumnContainerComponent, ColumnContainer } from '../../../table/table.module';
import { EntityColumnContext } from '../entity-column/entity-column.component';

@Component({
  selector: 'step-entity-column-container',
  templateUrl: './entity-column-container.component.html',
  styleUrls: ['./entity-column-container.component.scss'],
  providers: [
    {
      provide: ColumnContainer,
      useExisting: forwardRef(() => EntityColumnContainerComponent),
    },
    {
      provide: CustomColumnsBaseComponent,
      useExisting: forwardRef(() => EntityColumnContainerComponent),
    },
  ],
  standalone: false,
})
export class EntityColumnContainerComponent extends BaseColumnContainerComponent {
  readonly entityName = input.required<string>();
  readonly entityPath = input<string | undefined>();
  readonly entityColumnKey = input<string>('entityColumn');

  protected readonly entityContext = computed(() => {
    const entityName = this.entityName();
    const entityPath = this.entityPath();

    if (!!entityName && !!entityPath) {
      return { entityName, entityPath } as EntityColumnContext;
    }
    return entityName as EntityColumnContext;
  });
}
