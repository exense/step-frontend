import { Component, computed, inject, input, linkedSignal, untracked } from '@angular/core';
import { DialogsService, StepBasicsModule } from '../../../basics/step-basics.module';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import { filter, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  GridPresetSaveDialogComponent,
  GridPresetSaveDialogData,
  GridPresetSaveDialogResult,
} from '../grid-preset-save-dialog/grid-preset-save-dialog.component';
import { AuthService } from '../../../auth';

@Component({
  selector: 'step-grid-control-tool',
  imports: [StepBasicsModule],
  templateUrl: './grid-control-tool.component.html',
  styleUrl: './grid-control-tool.component.scss',
})
export class GridControlToolComponent {
  private _gridEditable = inject(GridEditableService);
  private _widgetPersistence = inject(WidgetsPersistenceStateService);
  private _dialogs = inject(DialogsService);
  private _matDialog = inject(MatDialog);
  private _auth = inject(AuthService);

  readonly hintEditGrid = input('Edit grid');
  readonly hintPresetSettings = input('Settings');
  readonly hintCancelResetPreset = input('Cancel edit mode and reset all unsaved changes.');
  readonly hintSave = input('Save layout changes');
  readonly hintSwitchLayout = input('Switch layout');

  protected readonly selectedPresetId = linkedSignal(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.id;
  });

  protected readonly isProtected = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return (
      preset?.visibility === 'Preset' ||
      (preset?.visibility === 'Shared' &&
        !!this._auth.isAuthenticated() &&
        preset?.creationUser !== this._auth.getUserID())
    );
  });

  protected readonly isShared = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.visibility === 'Shared';
  });

  protected readonly presets = this._widgetPersistence.gridPresets;
  protected readonly isEdit = this._gridEditable.editMode;

  protected handlePresetSelection(presetId: string): void {
    const isEdit = untracked(() => this.isEdit());
    if (!isEdit) {
      this.selectedPresetId.set(presetId);
      this._widgetPersistence.selectPreset(presetId);
      return;
    }

    this.selectedPresetId.set('');
    const hasChanges = untracked(() => this._widgetPersistence.hasChanges());
    const changeConfirmed$ = !hasChanges
      ? of(true)
      : this._dialogs.showWarning(
          'You have unsaved changes in current preset. If you switch the preset, changes will be lost. Do you want to continue?',
        );

    changeConfirmed$.subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._widgetPersistence.selectPreset(presetId);
      } else {
        const preset = untracked(() => this._widgetPersistence.selectedPreset());
        this.selectedPresetId.set(preset?.id);
      }
    });
  }

  protected toggleEditMode(): void {
    const isEdit = untracked(() => this.isEdit());
    const hasChanges = untracked(() => this._widgetPersistence.hasChanges());
    if (!isEdit) {
      this._gridEditable.setEditMode(true);
      return;
    }
    const changeConfirmed$ = !hasChanges
      ? of(true)
      : this._dialogs.showWarning(
          'You have unsaved changes in current preset. If you cancel edit mode, changes will be lost. Do you want to continue?',
        );

    changeConfirmed$.subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._widgetPersistence.resetState();
        this._gridEditable.setEditMode(false);
      }
    });
  }

  protected save(): void {
    const preset = untracked(() => this._widgetPersistence.selectedPreset())!;
    const isProtected = untracked(() => this.isProtected());
    const defaultName = `${preset.attributes!['name']!}_COPY`;
    this._matDialog
      .open<GridPresetSaveDialogComponent, GridPresetSaveDialogData, GridPresetSaveDialogResult>(
        GridPresetSaveDialogComponent,
        { data: { isProtected, defaultName } },
      )
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        switchMap(({ isOverride, name }) =>
          isOverride ? this._widgetPersistence.saveState() : this._widgetPersistence.createPreset(name!),
        ),
      )
      .subscribe(() => this._gridEditable.setEditMode(false));
  }

  protected remove(): void {
    const preset = untracked(() => this._widgetPersistence.selectedPreset())!;
    const presetId = preset.id!;
    this._dialogs
      .showWarning('Do you want to remove this preset?')
      .pipe(
        filter((isConfirmed) => !!isConfirmed),
        switchMap(() => this._widgetPersistence.removePreset(presetId)),
      )
      .subscribe(() => {});
  }

  protected share(): void {
    const preset = untracked(() => this._widgetPersistence.selectedPreset())!;
    const presetId = preset.id!;
    this._widgetPersistence.sharePreset(presetId).subscribe();
  }

  protected unshare(): void {
    const preset = untracked(() => this._widgetPersistence.selectedPreset())!;
    const presetId = preset.id!;
    this._widgetPersistence.unsharePreset(presetId).subscribe();
  }
}
