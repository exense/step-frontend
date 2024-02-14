import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CustomColumnsBaseComponent } from '../../modules/table/table.module';
import { ColumnContainer } from '../../shared';
import { BaseColumnContainerComponent } from '../base-column-container/base-column-container.component';
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
})
export class EntityColumnContainerComponent extends BaseColumnContainerComponent implements OnChanges {
  @Input() entityName!: string;
  @Input() entityPath?: string;

  protected entityContext?: EntityColumnContext;

  ngOnChanges(changes: SimpleChanges): void {
    let entityName: string | undefined;
    let entityPath: string | undefined;

    const cEntityName = changes['entityName'];
    const cEntityPath = changes['entityPath'];

    if (cEntityName?.previousValue !== cEntityName?.currentValue || cEntityName?.firstChange) {
      entityName = cEntityName?.currentValue;
    }

    if (cEntityPath?.previousValue !== cEntityPath?.currentValue || cEntityPath?.firstChange) {
      entityPath = cEntityPath?.currentValue;
    }

    this.entityContext = !!entityPath && !!entityName ? { entityName, entityPath } : entityName;
  }
}
