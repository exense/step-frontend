import {Component, computed, effect, inject, linkedSignal, untracked, viewChild} from '@angular/core';
import { GridEditableService } from '../../injectables/grid-editable.service';
import {DialogsService, PopoverComponent, PopoverMode, StepBasicsModule} from '../../../basics/step-basics.module';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import {MatDialog} from '@angular/material/dialog';
import {NewPresetDialogComponent, NewPresetDialogData} from '../new-preset-dialog/new-preset-dialog.component';
import {filter, of, switchMap} from 'rxjs';

@Component({
  selector: 'step-grid-config-tool',
  imports: [StepBasicsModule],
  templateUrl: './grid-config-tool.component.html',
  styleUrl: './grid-config-tool.component.scss',
})
export class GridConfigToolComponent {
  private _gridEditable = inject(GridEditableService);
  private _widgetPersistence = inject(WidgetsPersistenceStateService);
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);

  private gridSettingsPopover = viewChild('gridSettingsPopover', {read: PopoverComponent});

  protected readonly selectedPresetId = linkedSignal(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.id;
  });
  protected readonly isProtected = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return !!preset?.protected;
  });
  protected readonly presets = this._widgetPersistence.gridPresets;
  protected readonly isEdit = this._gridEditable.editMode;

  private effectShowPopoverOnEditStart = effect(() => {
    const isEdit = this.isEdit();
    const gridSettingsPopover = this.gridSettingsPopover();
    if (isEdit && gridSettingsPopover) {
      gridSettingsPopover.openPopover();
    }
  });

  protected startEdit(): void {
    this._gridEditable.setEditMode(true);
  }

  protected handlePresetSelection(presetId: string): void {
    this.selectedPresetId.set('');
    const hasChanges = untracked(() => this._widgetPersistence.hasChanges());
    const changeConfirmed$ = !hasChanges ?
      of(true) :
      this._dialogs.showWarning('You have unsaved changes in current preset. If you switch the preset, changes will be lost. Do you want to continue?')

    changeConfirmed$.subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._widgetPersistence.selectPreset(presetId)
        this._gridEditable.setEditMode(false);
      } else {
        const preset = untracked(() => this._widgetPersistence.selectedPreset());
        this.selectedPresetId.set(preset?.id);
        this.selectedPresetId.set(preset?.id);
      }
    });
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

  protected saveAsNew(): void {
    const presets = untracked(() => this.presets());
    const existedPresetNames = presets.map((item) => item.value);

    this._matDialog
      .open(NewPresetDialogComponent, {data: {existedPresetNames} as NewPresetDialogData})
      .afterClosed()
      .pipe(
        filter((name) => !!name),
        switchMap((name) => this._widgetPersistence.createPreset(name))
      )
      .subscribe(() => {
        this._gridEditable.setEditMode(false);
      });
  }

  protected removePreset(): void {
    const presetId = untracked(() => this.selectedPresetId())!;
    this._dialogs.showWarning(`Are you sure to delete the selected preset?`)
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => this._widgetPersistence.removePreset(presetId))
      )
      .subscribe(() => {
        this._gridEditable.setEditMode(false);
      });
  }

  protected readonly PopoverMode = PopoverMode;
}
