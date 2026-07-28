import { Component, computed, DestroyRef, inject, signal, untracked, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import {
  AuthService,
  DialogsService,
  FileDownloaderService,
  GridEditableService,
  GridPresetListItem,
  ReportLayoutJson,
  ReportLayoutService,
  Tab,
  WidgetStatePreset,
  WidgetsPersistenceStateService,
} from '@exense/step-core';
import { filter, map, Observable, of, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionTabsService, DrilldownExecutionTab, STATIC_TABS } from '../../services/alt-execution-tabs.service';

enum EditMode {
  CREATE = 'create',
  EDIT = 'edit',
  DUPLICATE = 'duplicate',
}

enum ExecutionViewTabType {
  LAYOUT = 'layout',
  PERFORMANCE = 'performance',
  DRILLDOWN = 'drilldown',
}

interface ExecutionViewTab extends Tab<string> {
  type: ExecutionViewTabType;
  layout?: GridPresetListItem;
  drilldown?: DrilldownExecutionTab;
}

interface PreviousTarget {
  type: ExecutionViewTabType;
  id?: string;
}

interface LayoutEditState {
  mode: EditMode;
  name: string;
  isShared: boolean;
  originalIsShared: boolean;
  previousTarget: PreviousTarget;
}

@Component({
  selector: 'step-alt-execution-tabs',
  templateUrl: './alt-execution-tabs.component.html',
  styleUrl: './alt-execution-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltExecutionTabsComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _tabsService = inject(AltExecutionTabsService);
  private _widgetsPersistence = inject(WidgetsPersistenceStateService);
  private _gridEditable = inject(GridEditableService);
  private _dialogs = inject(DialogsService);
  private _auth = inject(AuthService);
  private _reportLayoutApi = inject(ReportLayoutService);
  private _fileDownloader = inject(FileDownloaderService);

  protected readonly layoutPresets = this._widgetsPersistence.gridPresets;
  protected readonly selectedPreset = this._widgetsPersistence.selectedPreset;
  protected readonly drilldownTabs = this._tabsService.drilldownTabs;
  protected readonly activeDrilldownTabId = this._tabsService.activeDrilldownTabId;
  protected readonly selectedMenuLayout = signal<GridPresetListItem | undefined>(undefined);
  protected readonly editState = signal<LayoutEditState | undefined>(undefined);
  protected readonly currentUrl = signal(this._router.url);

  protected readonly isPerformanceActive = computed(() => {
    const currentUrl = this.currentUrl();
    const activeDrilldownTabId = this.activeDrilldownTabId();
    return currentUrl.includes(`/${STATIC_TABS.ANALYTICS}`) && !activeDrilldownTabId;
  });

  protected readonly canReadLayouts = computed(() => this.hasPermission('reportLayout-read'));
  protected readonly canCreateLayout = computed(() => this.hasPermission('reportLayout-write'));
  protected readonly isAdmin = computed(() => this.hasPermission('admin-ui-menu'));
  protected readonly canDownloadLayout = computed(() => {
    const isAdmin = this.isAdmin();
    const canReadLayouts = this.canReadLayouts();
    return isAdmin || canReadLayouts;
  });
  protected readonly isSelectedMenuLayoutForeignShared = computed(() => {
    const layout = this.selectedMenuLayout();
    return !!layout && this.isForeignSharedLayout(layout);
  });
  protected readonly canDownloadSelectedMenuLayout = computed(() => {
    const layout = this.selectedMenuLayout();
    const canDownloadLayout = this.canDownloadLayout();
    return !!layout && !!canDownloadLayout;
  });

  protected readonly canSaveEdit = computed(() => !!this.editState()?.name.trim());

  protected readonly tabs = computed<ExecutionViewTab[]>(() => {
    const canReadLayouts = this.canReadLayouts();
    const layoutPresets = this.layoutPresets();
    const drilldownExecutionTabs = this.drilldownTabs();

    const layoutTabs: ExecutionViewTab[] = (!canReadLayouts ? [] : layoutPresets).map((layout) => ({
      id: layout.key,
      label: layout.value,
      type: ExecutionViewTabType.LAYOUT,
      layout,
    }));

    const performanceTab: ExecutionViewTab = {
      id: STATIC_TABS.ANALYTICS,
      label: 'Performance',
      type: ExecutionViewTabType.PERFORMANCE,
    };

    const drilldownTabs: ExecutionViewTab[] = drilldownExecutionTabs.map((drilldown) => ({
      id: drilldown.id,
      label: drilldown.label,
      type: ExecutionViewTabType.DRILLDOWN,
      drilldown,
    }));

    return [...layoutTabs, performanceTab, ...drilldownTabs];
  });

  protected readonly activeTabId = computed<string | undefined>(() => {
    const drilldownId = this.activeDrilldownTabId();
    const isPerformanceActive = this.isPerformanceActive();
    const selectedPreset = this.selectedPreset();
    if (drilldownId) {
      return drilldownId;
    }
    if (isPerformanceActive) {
      return STATIC_TABS.ANALYTICS;
    }
    return selectedPreset?.id;
  });

  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.currentUrl.set(this._router.url);
        if (!this._router.url.includes('node-details')) {
          this._tabsService.clearActiveDrilldownTab();
        }
      });
  }

  protected selectTab(id: string): void {
    const tab = this.tabs().find((item) => item.id === id);
    switch (tab?.type) {
      case ExecutionViewTabType.LAYOUT:
        this.selectLayout(tab.layout!);
        break;
      case ExecutionViewTabType.PERFORMANCE:
        this.selectPerformance();
        break;
      case ExecutionViewTabType.DRILLDOWN:
        this.selectDrilldown(tab.drilldown!);
        break;
    }
  }

  private isLayoutActive(layout: GridPresetListItem): boolean {
    return (
      !this.isPerformanceActive() &&
      !this.activeDrilldownTabId() &&
      this.selectedPreset()?.id === layout.key &&
      this.currentUrl().includes(`/${STATIC_TABS.REPORT}`)
    );
  }

  private selectLayout(layout: GridPresetListItem): void {
    if (this.isLayoutActive(layout)) {
      return;
    }
    this._tabsService.clearActiveDrilldownTab();
    this._widgetsPersistence.selectPreset(layout.key);
    this.navigateToReport();
  }

  private selectPerformance(): void {
    this._tabsService.clearActiveDrilldownTab();
    this._router.navigate([STATIC_TABS.ANALYTICS], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  private selectDrilldown(tab: DrilldownExecutionTab): void {
    const activeTab = this._tabsService.activateDrilldownTab(tab.id);
    if (!activeTab) {
      return;
    }
    this.navigateToDrilldown(activeTab);
  }

  protected closeDrilldown(tab: DrilldownExecutionTab, event: MouseEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    const wasActive = this.activeDrilldownTabId() === tab.id;
    const nextTab = this._tabsService.removeDrilldownTab(tab.id);
    if (!wasActive) {
      return;
    }
    if (this.activeDrilldownTabId()) {
      this.navigateToDrilldown(nextTab!);
      return;
    }
    this._router.navigate([STATIC_TABS.REPORT], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  protected startCreate(): void {
    if (!this.canCreateLayout()) {
      return;
    }
    const previousTarget = this.getCurrentTarget();
    this._widgetsPersistence.selectLocalPreset({
      attributes: { name: '' },
      visibility: 'Private',
      layout: { widgets: [] } as WidgetStatePreset['layout'],
    });
    this.editState.set({ mode: EditMode.CREATE, name: '', isShared: false, originalIsShared: false, previousTarget });
    this._gridEditable.setEditMode(true);
    this.navigateToReport();
  }

  private get defaultMenuLayout(): GridPresetListItem | undefined {
    return untracked(() => this.selectedMenuLayout());
  }

  protected startEdit(layout = this.defaultMenuLayout): void {
    if (!layout || !this.canEditLayout(layout)) {
      return;
    }
    const previousTarget = this.getCurrentTarget();
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
        this.navigateToReport();
      });
  }

  protected startDuplicate(layout = this.defaultMenuLayout): void {
    if (!layout || !this.canCreateLayout()) {
      return;
    }
    const previousTarget = this.getCurrentTarget();
    this._widgetsPersistence
      .loadPreset(layout.key)
      .pipe(take(1))
      .subscribe((preset) => this.initializeDuplicatePreset(layout, previousTarget, preset));
  }

  protected deleteLayout(layout = this.defaultMenuLayout): void {
    if (!layout || !this.canDeleteLayout(layout)) {
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
          this.selectPerformance();
        }
      });
  }

  protected downloadLayout(layout = this.defaultMenuLayout): void {
    if (!layout || !this.canDownloadLayout()) {
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
        this.navigateToReport();
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
      this.restorePreviousTarget(previousTarget);
    });
  }

  protected canEditLayout(layout = this.defaultMenuLayout): boolean {
    if (!layout || layout.visibility === 'Preset' || this.isForeignLayout(layout)) {
      return false;
    }
    return this.hasPermission('reportLayout-write');
  }

  protected canDeleteLayout(layout = this.defaultMenuLayout): boolean {
    if (!layout || layout.visibility === 'Preset') {
      return false;
    }
    if (this.isForeignSharedLayout(layout)) {
      return this.hasPermission('reportLayout-shared-delete');
    }
    return this.hasPermission('reportLayout-delete');
  }

  private restorePreviousTarget(previousTarget?: PreviousTarget): void {
    if (previousTarget?.type === ExecutionViewTabType.PERFORMANCE) {
      this.selectPerformance();
      return;
    }
    if (previousTarget?.type === ExecutionViewTabType.DRILLDOWN && previousTarget.id) {
      const tab = this._tabsService.activateDrilldownTab(previousTarget.id);
      if (tab) {
        this.navigateToDrilldown(tab);
        return;
      }
    }
    const presetId = previousTarget?.type === ExecutionViewTabType.LAYOUT ? previousTarget.id : undefined;
    const layout =
      this.layoutPresets().find((item) => item.key === presetId) ??
      this.layoutPresets().find((item) => item.key === this.selectedPreset()?.id) ??
      this.layoutPresets()[0];
    if (layout) {
      this.selectLayout(layout);
      return;
    }
    this.selectPerformance();
  }

  private initializeDuplicatePreset(
    layout: GridPresetListItem,
    previousTarget: PreviousTarget,
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
    this.navigateToReport();
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

  private getCurrentTarget(): PreviousTarget {
    const activeDrilldownId = this.activeDrilldownTabId();
    if (activeDrilldownId) {
      return { type: ExecutionViewTabType.DRILLDOWN, id: activeDrilldownId };
    }
    if (this.isPerformanceActive()) {
      return { type: ExecutionViewTabType.PERFORMANCE };
    }
    return { type: ExecutionViewTabType.LAYOUT, id: this.selectedPreset()?.id };
  }

  private navigateToReport(): void {
    this._router.navigate([STATIC_TABS.REPORT], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  private navigateToDrilldown(tab: DrilldownExecutionTab): void {
    this._router.navigate(tab.nodeDetailsPath, {
      relativeTo: this._activatedRoute,
      queryParams: tab.queryParams as Params | undefined,
      queryParamsHandling: 'merge',
    });
  }

  private hasPermission(permission?: string): boolean {
    return !permission || this._auth.hasRight(permission);
  }

  private downloadLayoutJson(layout: GridPresetListItem, layoutJson?: ReportLayoutJson): void {
    const name = layoutJson?.name || layout?.value;
    const safeName = name?.trim?.().replace?.(/[^a-zA-Z0-9._-]+/g, '_') || 'execution-layout';
    const finalName = `${safeName}.json`;

    const jsonData = JSON.stringify(layoutJson ?? {}, null, 2);

    this._fileDownloader.downloadJson(jsonData, finalName);
  }

  protected isForeignSharedLayout(layout = this.defaultMenuLayout): boolean {
    return (
      layout?.visibility === 'Shared' &&
      !!this._auth.isAuthenticated() &&
      layout.creationUser !== this._auth.getUserID()
    );
  }

  protected isForeignLayout(layout = this.defaultMenuLayout): boolean {
    return !!layout?.creationUser && !!this._auth.isAuthenticated() && layout.creationUser !== this._auth.getUserID();
  }

  protected readonly ExecutionViewTabType = ExecutionViewTabType;
}
