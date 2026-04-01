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

  readonly layoutReadPermission = input<string>();
  readonly layoutWritePermission = input<string>();
  readonly layoutDeletePermission = input<string>();
  readonly layoutSharedWritePermission = input<string>();
  readonly layoutSharedDeletePermission = input<string>();

  protected readonly selectedPresetId = linkedSignal(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.id;
  });

  protected readonly isShared = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.visibility === 'Shared';
  });

  protected readonly presetName = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    return preset?.attributes?.['name'] ?? '';
  });

  protected readonly presets = this._widgetPersistence.gridPresets;
  protected readonly isEdit = this._gridEditable.editMode;
  protected readonly canReadLayouts = computed(() => this.hasPermission(this.layoutReadPermission()));
  protected readonly canSaveAsNew = computed(() => this.hasPermission(this.layoutWritePermission()));
  protected readonly canEditGrid = computed(() => {
    return this.canSave() || this.canDeleteCurrentLayout();
  });
  protected readonly canDeleteCurrentLayout = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    if (!preset || preset.visibility === 'Preset') {
      return false;
    }
    if (this.isForeignSharedPreset(preset)) {
      return this.hasPermission(this.layoutSharedDeletePermission());
    }
    return this.hasPermission(this.layoutDeletePermission());
  });
  protected readonly canOverrideCurrentLayout = computed(() => {
    const preset = this._widgetPersistence.selectedPreset();
    if (!preset || preset.visibility === 'Preset') {
      return false;
    }
    if (this.isForeignSharedPreset(preset)) {
      return this.hasPermission(this.layoutSharedWritePermission());
    }
    return this.hasPermission(this.layoutWritePermission());
  });
  protected readonly canSave = computed(() => this.canSaveAsNew() || this.canOverrideCurrentLayout());

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
    const canOverride = untracked(() => this.canOverrideCurrentLayout());
    const canSaveAsNew = untracked(() => this.canSaveAsNew());
    const isShared = untracked(() => this.isShared());
    const currentLayoutName = preset.attributes!['name']!;
    const defaultName = `${currentLayoutName}_COPY`;
    const existingPresetNames = untracked(() => this.presets()).map((p) => p.value);

    this._matDialog
      .open<GridPresetSaveDialogComponent, GridPresetSaveDialogData, GridPresetSaveDialogResult>(
        GridPresetSaveDialogComponent,
        { data: { canOverride, canSaveAsNew, defaultName, currentLayoutName, isShared, existingPresetNames } },
      )
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        switchMap(({ isOverride, name, isShared: newIsShared }) => {
          if (isOverride) {
            return this._widgetPersistence.saveState(name).pipe(
              switchMap(() => {
                const currentIsShared = untracked(() => this.isShared());
                if (newIsShared === currentIsShared) return of(undefined);
                return newIsShared
                  ? this._widgetPersistence.sharePreset(preset.id!)
                  : this._widgetPersistence.unsharePreset(preset.id!);
              }),
            );
          } else {
            return this._widgetPersistence.createPreset(name).pipe(
              switchMap((newPresetId) => {
                if (!newIsShared) return of(undefined);
                return this._widgetPersistence.sharePreset(newPresetId);
              }),
            );
          }
        }),
      )
      .subscribe(() => this._gridEditable.setEditMode(false));
  }

  protected remove(): void {
    const preset = untracked(() => this._widgetPersistence.selectedPreset())!;
    const presetId = preset.id!;
    const name = untracked(() => this.presetName());
    this._dialogs
      .showWarning(`Do you want to remove the layout: "${name}"?`)
      .pipe(
        filter((isConfirmed) => !!isConfirmed),
        switchMap(() => this._widgetPersistence.removePreset(presetId)),
      )
      .subscribe(() => this._gridEditable.setEditMode(false));
  }

  private hasPermission(permission?: string): boolean {
    return !permission || this._auth.hasRight(permission);
  }

  private isForeignSharedPreset(preset: ReturnType<WidgetsPersistenceStateService['selectedPreset']>): boolean {
    return (
      preset?.visibility === 'Shared' &&
      !!this._auth.isAuthenticated() &&
      preset.creationUser !== this._auth.getUserID()
    );
  }
}
