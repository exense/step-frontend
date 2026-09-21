import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AugmentedScreenService, TableApiWrapperService, TableResponseGeneric } from '../../client/step-client-module';
import { StepMaterialModule } from '../step-material/step-material.module';
import {
  EntitySelectionComponent,
  EntitySelectionState,
  entitySelectionStateProvider,
  SelectionList,
} from '../entities-selection';
import { ScreenDataMetaService } from '../basics/injectables/screen-data-meta.service';
import { REPOSITORY_PARAMETERS } from '../repository-parameters';
import { TableModule } from './table.module';
import { TableColumnsService, PlacePosition } from './services/table-columns.service';
import { tableColumnsConfigProvider } from './services/table-columns-config.provider';
import { ItemsPerPageService } from './services/items-per-page.service';
import { TableRemoteDataSource } from './shared/table-remote-data-source';
import { TableFetchLocalDataSource } from './shared/table-fetch-local-data-source';
import { DataSource } from './directives/table-part-datasource.directive';
import { TableComponent } from './components/table/table.component';

interface Row {
  id: string;
  name: string;
  team: string;
}

const rows: Row[] = [
  { id: 'a', name: 'Alpha', team: 'Red' },
  { id: 'b', name: 'Beta', team: 'Blue' },
  { id: 'c', name: 'Gamma', team: 'Red' },
  { id: 'd', name: 'Delta', team: 'Blue' },
];

@Component({
  selector: 'step-table-test',
  imports: [TableModule, StepMaterialModule, EntitySelectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ...entitySelectionStateProvider<string, Row>('id'),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'scenario',
      entityScreenId: 'scenario',
      entityScreenDefaultVisibleFields: ['team'],
    }),
  ],
  template: `
    <step-table [dataSource]="dataSource" matSort matSortActive="name" matSortDirection="asc">
      <ng-container matColumnDef="select">
        <th mat-header-cell *matHeaderCellDef>Select</th>
        <td mat-cell *matCellDef="let row"><step-entity-selection [entity]="row" /></td>
      </ng-container>
      <ng-container matColumnDef="name" stepSearchCol>
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
        <td mat-cell *matCellDef="let row">{{ row.name }}</td>
      </ng-container>
    </step-table>
  `,
})
/* eslint-disable step-lint/component-public-fields -- Test hosts expose their scenario inputs and results to assertions. */
class TableTestComponent {
  dataSource: DataSource<Row> = rows;
  readonly _selection = inject<EntitySelectionState<string, Row>>(EntitySelectionState);
}
/* eslint-enable step-lint/component-public-fields */

function settle(fixture: ComponentFixture<TableTestComponent>): void {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

function names(fixture: ComponentFixture<TableTestComponent>): string[] {
  const element: HTMLElement = fixture.nativeElement;
  return Array.from(element.querySelectorAll('tr.content-row .mat-column-name'), (cell) => cell.textContent!.trim());
}

function setSearchValue(fixture: ComponentFixture<TableTestComponent>, value: string): void {
  const element: HTMLElement = fixture.nativeElement;
  const input = element.querySelector<HTMLInputElement>('.mat-column-search-name input')!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function search(fixture: ComponentFixture<TableTestComponent>, value: string): void {
  setSearchValue(fixture, value);
  tick(201);
  settle(fixture);
}

describe('Table scenarios', () => {
  const api = {
    getTableSettings: jest.fn(),
    saveTableSettings: jest.fn(),
    requestTable: jest.fn(),
  };

  beforeEach(() => {
    api.getTableSettings.mockReset().mockReturnValue(of({ columnSettingList: [] }));
    api.saveTableSettings.mockReset().mockReturnValue(of({}));
    api.requestTable.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: REPOSITORY_PARAMETERS, useValue: [] },
        { provide: TableApiWrapperService, useValue: api },
        {
          provide: AugmentedScreenService,
          useValue: {
            getScreenInputsByScreenIdWithCache: () => of([{ input: { id: 'team', label: 'Team', type: 'TEXT' } }]),
          },
        },
        {
          provide: ItemsPerPageService,
          useValue: { getItemsPerPage: () => of([2, 5]), getDefaultPageSizeItem: () => of(2) },
        },
      ],
    });
    const route = TestBed.inject(ActivatedRoute);
    Object.defineProperty(route, 'routeConfig', { value: { path: '' } });
    TestBed.inject(ScreenDataMetaService).addMetaInformationAboutScreenToRoute('scenario', route);
  });

  it('sorts and pages local rows, filters back to the first page, and selects only filtered entities', fakeAsync(() => {
    const fixture = TestBed.createComponent(TableTestComponent);
    settle(fixture);
    expect(names(fixture)).toEqual(['Alpha', 'Beta']);
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('button[matTooltip="Next page"]')!.click();
    settle(fixture);
    expect(names(fixture)).toEqual(['Delta', 'Gamma']);
    tick(1);
    search(fixture, 'Alpha');
    expect(names(fixture)).toEqual(['Alpha']);
    element.querySelector<HTMLInputElement>('tr.content-row input[type="checkbox"]')!.click();
    settle(fixture);
    expect([...fixture.componentInstance._selection.selectedKeys()]).toEqual(['a']);
    search(fixture, 'missing');
    expect(names(fixture)).toEqual([]);
    expect(element.textContent).toContain('No matching records found');
    search(fixture, '');
    expect(names(fixture)).toEqual(['Alpha', 'Beta']);
    const table = fixture.debugElement.query(By.directive(TableComponent));
    table.injector.get(SelectionList).clearSelection();
    element.querySelector<HTMLElement>('.mat-sort-header-container')!.click();
    settle(fixture);
    expect(names(fixture)).toEqual(['Gamma', 'Delta']);
    table.injector.get(SelectionList).selectVisible();
    settle(fixture);
    expect([...fixture.componentInstance._selection.selectedKeys()].sort()).toEqual(['c', 'd']);
    fixture.destroy();
  }));

  it('renders custom columns and applies, resets, and saves column settings', fakeAsync(() => {
    const fixture = TestBed.createComponent(TableTestComponent);
    settle(fixture);
    const table = fixture.debugElement.query(By.directive(TableComponent));
    const columns = table.injector.get(TableColumnsService);
    const element: HTMLElement = fixture.nativeElement;
    const headers = (): string[] =>
      Array.from(element.querySelectorAll('tr:first-child th'), (cell) => cell.textContent!.trim());
    expect(headers()).toEqual(['Select', 'Name', 'Team']);
    expect(element.querySelector('tr.content-row .mat-column-team')!.textContent!.trim()).toBe('Red');
    columns.hideColumn('team');
    settle(fixture);
    expect(headers()).toEqual(['Select', 'Name']);
    columns.resetSettings();
    settle(fixture);
    expect(headers()).toEqual(['Select', 'Name', 'Team']);
    columns.moveColumn('team', 'name', PlacePosition.LEFT);
    settle(fixture);
    expect(headers()).toEqual(['Select', 'Team', 'Name']);
    columns.saveSettingsForScope(['user']);
    expect(api.saveTableSettings).toHaveBeenCalledWith(
      'scenario',
      expect.objectContaining({
        scope: ['user'],
        tableSettings: expect.objectContaining({
          columnSettingList: expect.arrayContaining([
            expect.objectContaining({ columnId: 'team', position: 1, visible: true }),
          ]),
        }),
      }),
    );
    expect(columns.hasChanges()).toBe(false);
    fixture.destroy();
  }));

  it('debounces remote searches, ignores superseded responses, and recovers after request errors', fakeAsync(() => {
    const first = new Subject<TableResponseGeneric<Row>>();
    const second = new Subject<TableResponseGeneric<Row>>();
    const failed = new Subject<TableResponseGeneric<Row>>();
    api.requestTable
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(failed)
      .mockReturnValue(of({ data: [rows[0]], recordsFiltered: 1, recordsTotal: 1 }));
    const fixture = TestBed.createComponent(TableTestComponent);
    fixture.componentInstance.dataSource = new TableRemoteDataSource<Row>(
      'scenario',
      TestBed.inject(TableApiWrapperService),
      { name: 'attributes.name' },
    );
    settle(fixture);
    tick(500);
    expect(api.requestTable).toHaveBeenCalledTimes(1);
    expect(api.requestTable).toHaveBeenLastCalledWith(
      'scenario',
      expect.objectContaining({ skip: 0, limit: 2, sort: [{ field: 'attributes.name', direction: 'ASCENDING' }] }),
      undefined,
    );
    setSearchValue(fixture, 'A');
    setSearchValue(fixture, 'Alpha');
    tick(201);
    settle(fixture);
    expect(api.requestTable).toHaveBeenCalledTimes(1);
    tick(500);
    expect(api.requestTable).toHaveBeenCalledTimes(2);
    expect(api.requestTable).toHaveBeenLastCalledWith(
      'scenario',
      expect.objectContaining({ filters: [{ field: 'attributes.name', value: 'Alpha', regex: true }] }),
      undefined,
    );
    second.next({ data: [rows[0]], recordsFiltered: 1, recordsTotal: 1 });
    second.complete();
    first.next({ data: [rows[1]], recordsFiltered: 1, recordsTotal: 1 });
    first.complete();
    settle(fixture);
    expect(names(fixture)).toEqual(['Alpha']);
    search(fixture, 'error');
    tick(500);
    failed.error(new Error('Request failed'));
    settle(fixture);
    expect(names(fixture)).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No matching records found');
    search(fixture, 'Alpha');
    tick(500);
    settle(fixture);
    expect(names(fixture)).toEqual(['Alpha']);
    fixture.destroy();
  }));

  it('reloads fetched local data while retaining the filter', fakeAsync(() => {
    const retrieve = jest
      .fn()
      .mockReturnValueOnce(of(rows))
      .mockReturnValueOnce(of([rows[0], { id: 'e', name: 'Alpine', team: 'Red' }]));
    const fixture = TestBed.createComponent(TableTestComponent);
    fixture.componentInstance.dataSource = new TableFetchLocalDataSource<Row>(retrieve);
    settle(fixture);
    search(fixture, 'Al');
    expect(names(fixture)).toEqual(['Alpha']);
    fixture.debugElement.query(By.directive(TableComponent)).componentInstance.reload();
    settle(fixture);
    expect(retrieve).toHaveBeenCalledTimes(2);
    expect(names(fixture)).toEqual(['Alpha', 'Alpine']);
    fixture.destroy();
  }));
});
