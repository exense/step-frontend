import { AfterViewInit, Component, inject } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ColumnContainer } from '../../shared';

@Component({
  selector: 'step-lock-column',
  templateUrl: './lock-column.component.html',
  styleUrls: ['./lock-column.component.scss'],
})
export class LockColumnComponent implements CustomComponent, AfterViewInit {
  private _entityColumnContainer = inject(ColumnContainer);

  context?: any;

  ngAfterViewInit(): void {
    this._entityColumnContainer.initColumns();
  }
}
