import {Component, computed, inject} from '@angular/core';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import {WidgetsVisibilityStateService} from '../../injectables/widgets-visibility-state.service';

@Component({
  selector: 'step-grid-config-tool',
  imports: [StepBasicsModule],
  templateUrl: './grid-config-tool.component.html',
  styleUrl: './grid-config-tool.component.scss',
})
export class GridConfigToolComponent {
  private _gridEditable = inject(GridEditableService);
  private _widgetPersistence = inject(WidgetsPersistenceStateService);
  private _widgetsVisibility = inject(WidgetsVisibilityStateService);

  protected readonly isEdit = this._gridEditable.editMode;

  protected readonly widgetsToAdd = computed(() => {
    const widgets = this._widgetsVisibility.visibilityInfo();
    return widgets.filter((item) => !item.isVisible);
  });

  protected readonly canAdd = computed(() => {
    const widgetsToAdd = this.widgetsToAdd();
    return widgetsToAdd.length > 0;
  });

  protected startEdit(): void {
    this._gridEditable.setEditMode(true);
  }

  protected reset(): void {
    this._widgetPersistence.resetState();
    this.save();
  }

  protected save(): void {
    this._widgetPersistence.saveState().subscribe(() => {
      this._gridEditable.setEditMode(false);
    });
  }

  protected addWidget(id: string): void {
    this._widgetsVisibility.show(id);
  }

  protected readonly PopoverMode = PopoverMode;
}
