import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import {
  GRID_LAYOUT_CONFIG,
  GridEditableService,
  GridPersistenceStateService,
  WidgetStatePreset,
  WidgetsPersistenceStateService,
} from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { WidgetsPositionsStateService } from '../../../../../../step-core/src/lib/modules/editable-grid-layout/injectables/widgets-positions-state.service';
import { WidgetsPositionsUtilsService } from '../../../../../../step-core/src/lib/modules/editable-grid-layout/injectables/widgets-positions-utils.service';
import { AltExecutionReportSettingsService } from './alt-execution-report-settings.service';
import { AltExecutionReportDetailKey } from '../shared/alt-execution-report-details';

describe('Execution report layout detail settings', () => {
  let settings: AltExecutionReportSettingsService;
  let persistence: WidgetsPersistenceStateService;
  let editable: GridEditableService;
  let layouts: Map<string, WidgetStatePreset>;
  const save = jest.fn<Observable<string>, [string, WidgetStatePreset]>();

  function layout(id: string, details: AltExecutionReportDetailKey[]): WidgetStatePreset {
    return {
      id,
      attributes: { name: id },
      layout: {
        widgets: [
          {
            widgetType: 'keywordsList',
            position: { row: 0, column: 0, widthInCells: 1, heightInCells: 1 },
            settings: { details },
          },
        ],
      } as WidgetStatePreset['layout'],
    };
  }

  function settleLayout(): void {
    TestBed.flushEffects();
    flushMicrotasks();
  }

  beforeEach(fakeAsync(() => {
    layouts = new Map([
      ['base', layout('base', ['fullDescription'])],
      ['other', layout('other', ['agentRouting'])],
    ]);
    save.mockReset();
    save.mockImplementation((gridId, preset): Observable<string> => {
      const id = preset.id ?? 'new-layout';
      layouts.set(id, JSON.parse(JSON.stringify({ ...preset, id })) as WidgetStatePreset);
      return of(id);
    });
    TestBed.configureTestingModule({
      providers: [
        AltExecutionReportSettingsService,
        GridEditableService,
        WidgetsPersistenceStateService,
        WidgetsPositionsStateService,
        WidgetsPositionsUtilsService,
        {
          provide: GRID_LAYOUT_CONFIG,
          useValue: { gridId: 'report', defaultElementParams: [], defaultElementParamsMap: {} },
        },
        {
          provide: GridPersistenceStateService,
          useValue: {
            save,
            load: (gridId: string, presetId: string): Observable<WidgetStatePreset | undefined> =>
              of(layouts.get(presetId)),
            getGridPresets: (): Observable<{ key: string; value: string }[]> =>
              of(Array.from(layouts.keys(), (id): { key: string; value: string } => ({ key: id, value: id }))),
            getGridPreferredPresetSelection: (): Observable<string> => of('base'),
            getGridDefaultPresetSelection: (): Observable<string> => of('base'),
            setGridSelectedPresetSelection: jest.fn(),
          },
        },
      ],
    });
    settings = TestBed.inject(AltExecutionReportSettingsService);
    persistence = TestBed.inject(WidgetsPersistenceStateService);
    editable = TestBed.inject(GridEditableService);
    settleLayout();
  }));

  it('shows saved Steps details after creating and editing a layout with an earlier empty view override', fakeAsync(() => {
    const details = settings.details('keywordsList');
    settings.updateDetail('keywordsList', 'fullDescription', false);
    expect(details()).toEqual([]);
    expect(persistence.getWidgetSettings('keywordsList')).toEqual({ details: ['fullDescription'] });
    expect(save).not.toHaveBeenCalled();

    persistence.createPreset('New Layout').subscribe();
    settleLayout();
    editable.setEditMode(true);
    settings.updateDetail('keywordsList', 'agentRouting', true);
    persistence.saveState().subscribe(() => editable.setEditMode(false));
    settleLayout();

    expect(layouts.get('new-layout')!.layout!.widgets[0].settings).toEqual({
      details: ['fullDescription', 'agentRouting'],
    });
    expect(details()).toEqual(['fullDescription', 'agentRouting']);
  }));

  it('shows the edited details immediately after saving the current layout', fakeAsync(() => {
    const details = settings.details('keywordsList');
    settings.updateDetail('keywordsList', 'fullDescription', false);
    expect(details()).toEqual([]);
    editable.setEditMode(true);
    settings.updateDetail('keywordsList', 'fullInputsOutputs', true);
    expect(details()).toEqual(['fullDescription', 'fullInputsOutputs']);

    persistence.saveState().subscribe(() => editable.setEditMode(false));
    settleLayout();

    expect(layouts.get('base')!.layout!.widgets[0].settings).toEqual({
      details: ['fullDescription', 'fullInputsOutputs'],
    });
    expect(details()).toEqual(['fullDescription', 'fullInputsOutputs']);
  }));

  it('uses the selected layout details when switching away from a layout with an empty view override', fakeAsync(() => {
    const details = settings.details('keywordsList');
    settings.updateDetail('keywordsList', 'fullDescription', false);
    expect(details()).toEqual([]);

    persistence.selectPreset('other');
    settleLayout();

    expect(details()).toEqual(['agentRouting']);
    expect(save).not.toHaveBeenCalled();
  }));
});
