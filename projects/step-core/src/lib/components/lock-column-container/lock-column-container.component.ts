import { Component, forwardRef } from '@angular/core';
import {
  BaseColumnContainerComponent,
  ColumnContainer,
  CustomColumnsBaseComponent,
} from '../../modules/table/table.module';

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
  standalone: false,
})
export class LockColumnContainerComponent extends BaseColumnContainerComponent {}
