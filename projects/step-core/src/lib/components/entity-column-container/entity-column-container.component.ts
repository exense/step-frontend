import { Component, forwardRef, Input } from '@angular/core';
import { CustomColumnsBaseComponent } from '../../modules/table/table.module';
import { ColumnContainer } from '../../shared';
import { BaseColumnContainerComponent } from '../base-column-container/base-column-container.component';

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
export class EntityColumnContainerComponent extends BaseColumnContainerComponent {
  @Input() entityName!: string;
}
