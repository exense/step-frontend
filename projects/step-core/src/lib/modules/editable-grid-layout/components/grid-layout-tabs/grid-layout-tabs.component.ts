import { Component, computed, contentChild, inject, signal, ViewEncapsulation } from '@angular/core';
import { filter, map, Observable, of, switchMap, take } from 'rxjs';
import { DialogsService, FileDownloaderService, StepBasicsModule } from '../../../basics/step-basics.module';
import { TAB_EXPORTS } from '../../../tabs';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { AuthService } from '../../../auth';
import { GridPresetListItem } from '../../types/grid-preset-list-item';
import { WidgetStatePreset } from '../../types/widget-state-preset';
import { ReportLayoutJson, ReportLayoutService } from '../../../../client/generated';
import { GridLayoutTab } from '../../types/grid-layout-tab';
import { IsForeignSharedLayoutPipe } from './is-foreign-shared-layout.pipe';
import { CanEditLayoutPipe } from './can-edit-layout.pipe';
import { CanDeleteLayoutPipe } from './can-delete-layout.pipe';
import { CanDownloadLayoutPipe } from './can-download-layout.pipe';
import { GridLayoutPermissionUtilsService } from '../../injectables/grid-layout-permission-utils.service';
import { LayoutPermissions } from '../../types/layout-permissions';
import { GridLayoutExternalTabDirective } from './grid-layout-external-tab.directive';
import { IsExternalTabPipe } from './is-external-tab.pipe';
import { GridLayoutExternalTabsService } from '../../injectables/grid-layout-external-tabs.service';

enum EditMode {
  CREATE = 'create',
  EDIT = 'edit',
  DUPLICATE = 'duplicate',
}

interface LayoutEditState {
  mode: EditMode;
  name: string;
  isShared: boolean;
  originalIsShared: boolean;
  previousTarget?: string;
}

@Component({
  selector: 'step-grid-layout-tabs',
  templateUrl: './grid-layout-tabs.component.html',
  styleUrl: './grid-layout-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    StepBasicsModule,
    TAB_EXPORTS,
    IsForeignSharedLayoutPipe,
    CanEditLayoutPipe,
    CanDeleteLayoutPipe,
    CanDownloadLayoutPipe,
    IsExternalTabPipe,
  ],
})
export class GridLayoutTabsComponent {
  private _widgetsPersistence = inject(WidgetsPersistenceStateService);
  private _layoutPermissionUtils = inject(GridLayoutPermissionUtilsService);
  private _gridEditable = inject(GridEditableService);
  private _dialogs = inject(DialogsService);
  private _auth = inject(AuthService);
  private _reportLayoutApi = inject(ReportLayoutService);
  private _fileDownloader = inject(FileDownloaderService);
  private _gridLayoutExternalTabs = inject(GridLayoutExternalTabsService, { optional: true });

  protected readonly layoutPresets = this._widgetsPersistence.gridPresets;
  protected readonly selectedPreset = this._widgetsPersistence.selectedPreset;
  protected readonly editState = signal<LayoutEditState | undefined>(undefined);

  protected readonly canReadLayouts = computed(() => this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_READ));
  protected readonly canCreateLayout = computed(() => this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_WRITE));

  protected readonly canSaveEdit = computed(() => {
    const editState = this.editState();
    return !!editState?.name.trim();
  });

  protected readonly tabs = computed<GridLayoutTab[]>(() => {
    const canReadLayouts = this.canReadLayouts();
    const layoutPresets = this.layoutPresets();
    const externalTabs = this._gridLayoutExternalTabs?.externalTabs?.() ?? [];

    const layoutTabs: GridLayoutTab[] = (!canReadLayouts ? [] : layoutPresets).map((layout) => ({
      id: layout.key,
      label: layout.value,
      layout,
    }));

    return [...layoutTabs, ...externalTabs];
  });

  protected readonly activeTabId = computed<string | undefined>(() => {
    const selectedPreset = this.selectedPreset();
    const externalActiveTabId = this._gridLayoutExternalTabs?.externalActiveTabId?.();
    if (externalActiveTabId) {
      return externalActiveTabId;
    }
    return selectedPreset?.id;
  });

  private readonly externalTabDirective = contentChild(GridLayoutExternalTabDirective);
  protected readonly externalTabTemplate = computed(() => this.externalTabDirective()?._templateRef);

  protected selectTab(id: string): void {
    const tab = this.tabs().find((item) => item.id === id);
    if (!tab) {
      return;
    }

    if (this._gridLayoutExternalTabs?.isExternalTab?.(tab)) {
      this._gridLayoutExternalTabs.selectExternalTab(tab);
      return;
    }
    this.selectLayout(tab.layout!);
  }

  private isLayoutActive(layout: GridPresetListItem): boolean {
    const externalActiveTabId = this._gridLayoutExternalTabs?.externalActiveTabId?.();
    if (!!externalActiveTabId) {
      return false;
    }
    return this.selectedPreset()?.id === layout.key;
  }

  private selectLayout(layout: GridPresetListItem): void {
    if (this.isLayoutActive(layout)) {
      return;
    }
    this._widgetsPersistence.selectPreset(layout.key);
    this._gridLayoutExternalTabs?.cleanupExternalState?.();
  }

  protected startCreate(): void {
    if (!this.canCreateLayout()) {
      return;
    }
    const previousTarget = this.activeTabId();
    this._widgetsPersistence.selectLocalPreset({
      attributes: { name: '' },
      visibility: 'Private',
      layout: { widgets: [] } as WidgetStatePreset['layout'],
    });
    this.editState.set({ mode: EditMode.CREATE, name: '', isShared: false, originalIsShared: false, previousTarget });
    this._gridEditable.setEditMode(true);
    this._gridLayoutExternalTabs?.cleanupExternalState?.();
  }

  protected startEdit(layout: GridPresetListItem): void {
    if (!layout || !this._layoutPermissionUtils.canEditLayout(layout)) {
      return;
    }
    const previousTarget = this.activeTabId();
    this._widgetsPersistence
      .selectPresetAndLoad(layout.key)
      .pipe(take(1))
      .subscribe((preset) => {
        if (!preset) {
          return;
        }
        this.editState.set({
          mode: EditMode.EDIT,
          name: preset.attributes?.['name'] ?? layout.value,
          isShared: preset.visibility === 'Shared',
          originalIsShared: preset.visibility === 'Shared',
          previousTarget,
        });
        this._gridEditable.setEditMode(true);
        this._gridLayoutExternalTabs?.cleanupExternalState?.();
      });
  }

  protected startDuplicate(layout: GridPresetListItem): void {
    if (!layout || !this.canCreateLayout()) {
      return;
    }
    const previousTarget = this.activeTabId();
    this._widgetsPersistence
      .loadPreset(layout.key)
      .pipe(take(1))
      .subscribe((preset) => this.initializeDuplicatePreset(layout, previousTarget, preset));
  }

  protected deleteLayout(layout: GridPresetListItem): void {
    if (!layout || !this._layoutPermissionUtils.canDeleteLayout(layout)) {
      return;
    }
    const isActiveLayout = this.selectedPreset()?.id === layout.key;
    this._dialogs
      .showWarning(`Do you want to remove the layout: "${layout.value}"?`)
      .pipe(
        filter((isConfirmed) => !!isConfirmed),
        switchMap(() => this._widgetsPersistence.removePreset(layout.key, false)),
      )
      .subscribe(() => {
        if (!isActiveLayout) {
          return;
        }
        const fallback = this.layoutPresets()[0];
        if (fallback) {
          this.selectLayout(fallback);
        } else {
          this._gridLayoutExternalTabs?.selectExternalDefault?.();
        }
      });
  }

  protected downloadLayout(layout: GridPresetListItem): void {
    if (!this._layoutPermissionUtils.canDownloadLayout(layout)) {
      return;
    }
    this._reportLayoutApi
      .exportLayout(layout.key)
      .pipe(take(1))
      .subscribe((layoutJson) => this.downloadLayoutJson(layout, layoutJson));
  }

  protected updateEditName(name: string): void {
    this.editState.update((state) => (state ? { ...state, name } : state));
  }

  protected updateEditShared(isShared: boolean): void {
    this.editState.update((state) => (state ? { ...state, isShared } : state));
  }

  protected saveEdit(): void {
    const state = this.editState();
    const name = state?.name.trim();
    if (!state || !name) {
      return;
    }
    const save$: Observable<string | undefined> =
      state.mode === 'edit'
        ? this._widgetsPersistence.saveState(name).pipe(map(() => this.selectedPreset()?.id))
        : this._widgetsPersistence.createPreset(name);
    save$
      .pipe(
        switchMap((presetId) => this.saveSharedState(presetId, state)),
        take(1),
      )
      .subscribe(() => {
        this.editState.set(undefined);
        this._gridEditable.setEditMode(false);
      });
  }

  protected cancelEdit(): void {
    const hasChanges = this._gridEditable.hasChanges();
    const confirmed$ = !hasChanges
      ? of(true)
      : this._dialogs.showWarning(
          'You have unsaved changes in current preset. If you cancel edit mode, changes will be lost. Do you want to continue?',
        );

    confirmed$.pipe(take(1)).subscribe((isConfirmed) => {
      if (!isConfirmed) {
        return;
      }
      const previousTarget = this.editState()?.previousTarget;
      this._gridEditable.reset();
      this.editState.set(undefined);
      if (previousTarget) {
        this.selectTab(previousTarget);
      }
    });
  }

  private initializeDuplicatePreset(
    layout: GridPresetListItem,
    previousTarget?: string,
    preset?: WidgetStatePreset,
  ): void {
    if (!preset) {
      return;
    }
    const name = `${preset.attributes?.['name'] ?? layout.value}_COPY`;
    const duplicatedPreset: WidgetStatePreset = {
      ...preset,
      id: undefined,
      visibility: 'Private',
      creationDate: undefined,
      creationUser: undefined,
      lastModificationDate: undefined,
      lastModificationUser: undefined,
      attributes: { ...preset.attributes, name },
      layout: {
        widgets: [...(preset.layout?.widgets ?? [])],
      } as WidgetStatePreset['layout'],
    };
    this._widgetsPersistence.selectLocalPreset(duplicatedPreset);
    const isShared = preset.visibility === 'Shared';
    this.editState.set({ mode: EditMode.DUPLICATE, name, isShared, originalIsShared: false, previousTarget });
    this._gridEditable.setEditMode(true);
    this._gridLayoutExternalTabs?.cleanupExternalState?.();
  }

  private saveSharedState(presetId: string | undefined, state: LayoutEditState): Observable<unknown> {
    if (!presetId) {
      return of(undefined);
    }
    if (state.isShared) {
      return state.originalIsShared ? of(undefined) : this._widgetsPersistence.sharePreset(presetId);
    }
    if (state.mode === 'edit' && state.originalIsShared) {
      return this._widgetsPersistence.unsharePreset(presetId);
    }
    return of(undefined);
  }

  private downloadLayoutJson(layout: GridPresetListItem, layoutJson?: ReportLayoutJson): void {
    const name = layoutJson?.name || layout?.value;
    const safeName = name?.trim?.().replace?.(/[^a-zA-Z0-9._-]+/g, '_') || 'execution-layout';
    const finalName = `${safeName}.json`;

    const jsonData = JSON.stringify(layoutJson ?? {}, null, 2);

    this._fileDownloader.downloadJson(jsonData, finalName);
  }
}
