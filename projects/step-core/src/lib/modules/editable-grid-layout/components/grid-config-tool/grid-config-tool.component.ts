import { Component, inject } from '@angular/core';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';

@Component({
  selector: 'step-grid-config-tool',
  imports: [StepBasicsModule],
  templateUrl: './grid-config-tool.component.html',
  styleUrl: './grid-config-tool.component.scss',
})
export class GridConfigToolComponent {
  private _gridEditable = inject(GridEditableService);
  private _widgetPersistence = inject(WidgetsPersistenceStateService);

  protected readonly isEdit = this._gridEditable.editMode;

  protected startEdit(): void {
    this._gridEditable.setEditMode(true);
  }

  protected reset(): void {
    this._widgetPersistence.resetState();
  }

  protected save(): void {
    this._widgetPersistence.saveState().subscribe(() => {
      this._gridEditable.setEditMode(false);
    });
  }

  protected readonly PopoverMode = PopoverMode;
}
