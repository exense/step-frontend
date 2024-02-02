import { Component, forwardRef } from '@angular/core';
import { BaseColumnContainerComponent } from '../base-column-container/base-column-container.component';
import { ColumnContainer } from '../../shared';
import { CustomColumnsBaseComponent } from '../../modules/table/table.module';

@Component({
  selector: 'step-lock-column-container',
  templateUrl: './lock-column-container.component.html',
  styleUrls: ['./lock-column-container.component.scss'],
  providers: [
    {
      provide: ColumnContainer,
      useExisting: forwardRef(() => LockColumnContainerComponent),
    },
    {
      provide: CustomColumnsBaseComponent,
      useExisting: forwardRef(() => LockColumnContainerComponent),
    },
  ],
})
export class LockColumnContainerComponent extends BaseColumnContainerComponent {}
