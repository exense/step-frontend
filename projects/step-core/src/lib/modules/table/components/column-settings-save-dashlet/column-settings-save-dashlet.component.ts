import { Component, inject, ViewEncapsulation } from '@angular/core';
import { TableColumnsService } from '../../services/table-columns.service';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';

@Component({
  selector: 'step-column-settings-save-dashlet',
  templateUrl: './column-settings-save-dashlet.component.html',
  styleUrl: './column-settings-save-dashlet.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ColumnSettingsSaveDashletComponent implements CustomComponent {
  context?: any;
  protected readonly _tableColumns = inject(TableColumnsService);
}
