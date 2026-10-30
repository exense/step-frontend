import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  isSignal,
  reflectComponentType,
  Signal,
  signal,
  Type,
} from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import {
  AugmentedTimeSeriesService,
  REPOSITORY_PARAMETERS,
  RichEditorDialogService,
  TableApiWrapperService,
  TableLocalDataSource,
  TimeSeriesErrorEntry,
} from '@exense/step-core';
import { of } from 'rxjs';
import * as frontendPublicApi from '../../../../../public-api';
import { ClampFadeDirective } from '../../../../../../../step-core/src/lib/directives/clamp-fade.directive';
import { StepBasicsModule } from '../../../../../../../step-core/src/lib/modules/basics/step-basics.module';
import {
  StepIconComponent,
  StepIconsModule,
} from '../../../../../../../step-core/src/lib/modules/step-icons/step-icons.module';
import { StepMaterialModule } from '../../../../../../../step-core/src/lib/modules/step-material/step-material.module';
import { TableModule } from '../../../../../../../step-core/src/lib/modules/table/table.module';
import { ItemsPerPageService } from '../../../../../../../step-core/src/lib/modules/table/services/items-per-page.service';
import { AltReportWidgetContentDirective } from '../../directives/alt-report-widget-content.directive';
import { AltReportWidgetTitleDirective } from '../../directives/alt-report-widget-title.directive';
import { SearchErrorType } from '../../shared/search-error';
import { AltExecutionErrorsComponent } from '../alt-execution-errors/alt-execution-errors.component';
import { AltReportWidgetComponent } from '../alt-report-widget/alt-report-widget.component';
import { ErrorDetailsMenuComponent } from '../error-details-menu/error-details-menu.component';
import { StatusComponent } from '../status/status.component';
import { AltExecutionErrorsWidgetComponent } from './alt-execution-errors-widget.component';

// The approved structural contract keeps the pre-implementation baseline executable while the public export is absent.
interface ConsumerAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly isAvailable: () => boolean;
  readonly activate: (error: TimeSeriesErrorEntry) => void;
}

interface ConsumerActionsService {
  readonly availableActions: Signal<readonly ConsumerAction[]>;
  register(action: ConsumerAction): () => void;
}

function actionsServiceType(): Type<ConsumerActionsService> {
  const exportedService: unknown = Reflect.get(frontendPublicApi, 'ErrorSearchActionsService');
  expect({ ErrorSearchActionsService: typeof exportedService }).toEqual({ ErrorSearchActionsService: 'function' });
  return exportedService as Type<ConsumerActionsService>;
}

function expectInput<T>(component: Type<T>, name: string): void {
  expect(reflectComponentType(component)?.inputs.map((input) => input.templateName)).toContain(name);
}

function error(options: Partial<TimeSeriesErrorEntry> = {}): TimeSeriesErrorEntry {
  return {
    errorMessage: 'Payment request failed: (gateway.*)',
    errorCode: 500,
    count: 1,
    percentage: 100,
    executionIds: ['execution-1'],
    executionIdsTruncated: false,
    types: ['FAILED'],
    ...options,
  };
}

function destinations(activate = jest.fn()): readonly ConsumerAction[] {
  return [
    { id: 'tree', label: 'Find error in tree', icon: 'tree' },
    { id: 'steps', label: 'Find error in Steps', icon: 'list' },
    { id: 'testCases', label: 'Find error in Test Cases', icon: 'plan-testcase' },
  ].map((action) => ({ ...action, isAvailable: (): boolean => true, activate }));
}

function settle<T>(fixture: ComponentFixture<T>): void {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

function button<T>(fixture: ComponentFixture<T>, label: string): HTMLButtonElement | undefined {
  const element: HTMLElement = fixture.nativeElement;
  return Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
    (candidate) => candidate.getAttribute('aria-label') === label || candidate.textContent?.trim() === label,
  );
}

function expectAction<T>(fixture: ComponentFixture<T>, action: ConsumerAction): HTMLButtonElement {
  const result = button(fixture, action.label);
  expect(result).toBeDefined();
  const tooltip = fixture.debugElement
    .queryAll(By.directive(MatTooltip))
    .find((candidate) => candidate.nativeElement === result);
  expect(tooltip?.injector.get(MatTooltip).message).toBe(action.label);
  const icon = fixture.debugElement
    .queryAll(By.directive(StepIconComponent))
    .find((candidate) => result!.contains(candidate.nativeElement));
  expect((icon?.componentInstance as StepIconComponent | undefined)?.name).toBe(action.icon);
  return result!;
}

@Component({
  selector: 'step-error-actions-consumer',
  template: `
    <step-alt-execution-errors-widget [errors]="errors()" [searchActions]="_actions.availableActions()" />
    <step-alt-execution-errors
      [dataSource]="dataSource"
      [searchActions]="_actions.availableActions()"
      [showExecutionsMenu]="false"
    />
  `,
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/* eslint-disable step-lint/component-public-fields -- This consumer host exposes its public scenario inputs and registry. */
class ConsumerHostComponent {
  readonly _actions = inject(actionsServiceType());
  readonly _destroyRef = inject(DestroyRef);
  readonly errors = signal([error()]);
  readonly dataSource = new TableLocalDataSource([
    error(),
    error({ errorMessage: 'Second distinct error', errorCode: 501 }),
  ]);
}
/* eslint-enable step-lint/component-public-fields */

jest.mock('../../../timeseries/modules/_common/types/uPlot', () => ({}));

describe('SED-5023 public error search action acceptance', () => {
  const fixtures: ComponentFixture<unknown>[] = [];

  function create<T>(component: Type<T>): ComponentFixture<T> {
    const fixture = TestBed.createComponent(component);
    fixtures.push(fixture);
    return fixture;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ClampFadeDirective,
        StepBasicsModule,
        StepIconsModule,
        StepMaterialModule,
        TableModule,
        AltReportWidgetContentDirective,
      ],
      declarations: [
        AltExecutionErrorsWidgetComponent,
        AltExecutionErrorsComponent,
        AltReportWidgetComponent,
        AltReportWidgetTitleDirective,
        StatusComponent,
        ErrorDetailsMenuComponent,
        ConsumerHostComponent,
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: REPOSITORY_PARAMETERS, useValue: [] },
        { provide: AugmentedTimeSeriesService, useValue: {} },
        { provide: RichEditorDialogService, useValue: { editText: jest.fn() } },
        {
          provide: TableApiWrapperService,
          useValue: { getTableSettings: () => of({ columnSettingList: [] }), saveTableSettings: () => of({}) },
        },
        {
          provide: ItemsPerPageService,
          useValue: { getItemsPerPage: () => of([10, 25]), getDefaultPageSizeItem: () => of(10) },
        },
      ],
    });
  });

  afterEach(() => {
    fixtures.splice(0).forEach((fixture) => fixture.destroy());
  });

  it('AC-1 AC-2 AC-4: renders destination buttons for one distinct error and activates the current entry once', fakeAsync(() => {
    expectInput(AltExecutionErrorsWidgetComponent, 'searchActions');
    const fixture = create(AltExecutionErrorsWidgetComponent);
    const activate = jest.fn();
    const legacySearch = jest.fn();
    fixture.componentInstance.searchFor.subscribe(legacySearch);
    const actions = destinations(activate);
    fixture.componentRef.setInput('searchActions', actions);
    const entry = error();
    fixture.componentRef.setInput('errors', [entry]);
    settle(fixture);
    actions.forEach((action) => {
      expectAction(fixture, action).click();
      expect(activate).toHaveBeenLastCalledWith(entry);
    });
    expect(activate).toHaveBeenCalledTimes(3);
    expect(legacySearch).not.toHaveBeenCalled();

    const repeated = error({ count: 5, types: ['FAILED', 'TECHNICAL_ERROR'] });
    fixture.componentRef.setInput('errors', [repeated]);
    settle(fixture);
    actions.forEach((action) => {
      expectAction(fixture, action).click();
      expect(activate).toHaveBeenLastCalledWith(repeated);
    });
    expect(activate).toHaveBeenCalledTimes(6);

    const current = error({ errorMessage: 'Current selected error', types: ['TECHNICAL_ERROR'] });
    fixture.componentRef.setInput('errors', [current]);
    settle(fixture);
    actions.forEach((action) => expectAction(fixture, action));
    button(fixture, 'Find error in Steps')!.click();
    expect(activate).toHaveBeenLastCalledWith(current);
    expect(activate).toHaveBeenCalledTimes(7);
    expect(legacySearch).not.toHaveBeenCalled();
  }));

  it('AC-4 AC-5: toggles the multiple-error table link and omits it for a single distinct error', fakeAsync(() => {
    expectInput(AltExecutionErrorsWidgetComponent, 'showDetailsAvailable');
    const fixture = create(AltExecutionErrorsWidgetComponent);
    fixture.componentRef.setInput('errors', [
      error(),
      error({ errorMessage: 'Second distinct error', errorCode: 501 }),
    ]);
    fixture.componentRef.setInput('showDetailsAvailable', false);
    settle(fixture);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent!.replace(/\s+/g, ' ')).toContain('2 distinct errors · 2 occurrences');
    expect(element.textContent).not.toContain('error table');
    fixture.componentRef.setInput('showDetailsAvailable', true);
    settle(fixture);
    const details = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href]')).find(
      (link) => link.textContent?.trim() === 'error table',
    );
    expect(details).toBeDefined();
    const showDetails = jest.fn();
    fixture.componentInstance.showDetails.subscribe(showDetails);
    details!.click();
    expect(showDetails).toHaveBeenCalledTimes(1);

    [error(), error({ count: 5 })].forEach((entry) => {
      fixture.componentRef.setInput('errors', [entry]);
      fixture.componentRef.setInput('showDetailsAvailable', false);
      settle(fixture);
      expect(element.textContent!.replace(/\s+/g, ' ')).toContain(
        `1 distinct error · ${entry.count} ${entry.count === 1 ? 'occurrence' : 'occurrences'}`,
      );
      expect(element.textContent).toContain(entry.errorMessage);
      expect(element.textContent).not.toContain('error table');
      fixture.componentRef.setInput('showDetailsAvailable', true);
      settle(fixture);
      const restored = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href]')).find(
        (link) => link.textContent?.trim() === 'error table',
      );
      expect(restored).toBeUndefined();
      expect(showDetails).toHaveBeenCalledTimes(1);
    });
  }));

  it('AC-4: preserves the standalone overview tree event when searchActions is omitted', fakeAsync(() => {
    const fixture = create(AltExecutionErrorsWidgetComponent);
    const legacySearch = jest.fn();
    fixture.componentInstance.searchFor.subscribe(legacySearch);
    const entry = error();
    fixture.componentRef.setInput('errors', [entry]);
    settle(fixture);
    const tree = expectAction(fixture, destinations()[0]);
    tree.click();
    expect(legacySearch).toHaveBeenCalledTimes(1);
    expect(legacySearch).toHaveBeenCalledWith(entry.errorMessage);

    const element: HTMLElement = fixture.nativeElement;
    const interactiveElements = element.querySelectorAll<HTMLElement>(
      'a[href], button, [role="link"], [role="button"]',
    );
    expect(
      Array.from(interactiveElements).some((candidate) => candidate.textContent?.includes(entry.errorMessage)),
    ).toBe(false);
    const message = Array.from(element.querySelectorAll<HTMLElement>('*')).find(
      (candidate) => candidate.textContent?.trim() === entry.errorMessage,
    );
    expect(message).toBeDefined();
    message!.click();
    expect(legacySearch).toHaveBeenCalledTimes(1);
  }));

  it('AC-4 AC-5: preserves standalone table typed navigation and the Test Cases gate with corrected accessible labels', fakeAsync(() => {
    const fixture = create(AltExecutionErrorsComponent);
    const entry = error();
    fixture.componentRef.setInput('dataSource', new TableLocalDataSource([entry]));
    fixture.componentRef.setInput('showExecutionsMenu', false);
    fixture.componentRef.setInput('hasTestCases', false);
    const search = jest.fn();
    fixture.componentInstance.searchFor.subscribe(search);
    settle(fixture);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(entry.errorMessage);
    expect(button(fixture, 'Find error in Test Cases')).toBeUndefined();
    expectAction(fixture, destinations()[0]).click();
    expect(search).toHaveBeenLastCalledWith({ type: SearchErrorType.TREE, value: entry.errorMessage });
    expectAction(fixture, destinations()[1]).click();
    expect(search).toHaveBeenLastCalledWith({ type: SearchErrorType.KEYWORD, value: entry.errorMessage });
    fixture.componentRef.setInput('hasTestCases', true);
    settle(fixture);
    expectAction(fixture, destinations()[2]).click();
    expect(search).toHaveBeenLastCalledWith({ type: SearchErrorType.TEST_CASE, value: entry.errorMessage });
    expect(search).toHaveBeenCalledTimes(3);
  }));

  it('AC-5: treats supplied action arrays as authoritative and preserves showActions=false for the real table', fakeAsync(() => {
    expectInput(AltExecutionErrorsWidgetComponent, 'searchActions');
    expectInput(AltExecutionErrorsComponent, 'searchActions');
    const overview = create(AltExecutionErrorsWidgetComponent);
    const table = create(AltExecutionErrorsComponent);
    overview.componentRef.setInput('errors', [error()]);
    overview.componentRef.setInput('searchActions', []);
    table.componentRef.setInput('dataSource', new TableLocalDataSource([error()]));
    table.componentRef.setInput('showExecutionsMenu', false);
    table.componentRef.setInput('hasTestCases', true);
    table.componentRef.setInput('searchActions', []);
    settle(overview);
    settle(table);
    destinations().forEach((action) => {
      expect(button(overview, action.label)).toBeUndefined();
      expect(button(table, action.label)).toBeUndefined();
    });
    const steps = destinations()[1];
    table.componentRef.setInput('searchActions', [steps]);
    settle(table);
    expectAction(table, steps);
    expect(button(table, 'Find error in tree')).toBeUndefined();
    table.componentRef.setInput('showActions', false);
    settle(table);
    expect(button(table, steps.label)).toBeUndefined();
    expect((table.nativeElement as HTMLElement).textContent).not.toContain('Actions');
  }));

  it('AC-6: registers ordered reactive contributions, rejects duplicate IDs and unregisters only the owning contribution', () => {
    const Service = actionsServiceType();
    TestBed.configureTestingModule({ providers: [Service] });
    const registry = TestBed.inject(Service);
    expect(isSignal(registry.availableActions)).toBe(true);
    const available = signal(true);
    const first = {
      ...destinations()[0],
      id: 'consumer',
      label: 'Find error in additional tree',
      isAvailable: (): boolean => available(),
    };
    const removeFirst = registry.register(first);
    const second = destinations()[1];
    const removeSecond = registry.register(second);
    expect(registry.availableActions()).toEqual([first, second]);
    expect(() => registry.register({ ...first, label: 'Replacement' })).toThrow(/consumer|duplicate|already/i);
    expect(registry.availableActions()).toEqual([first, second]);
    available.set(false);
    expect(registry.availableActions()).toEqual([second]);
    available.set(true);
    expect(registry.availableActions()).toEqual([first, second]);
    removeFirst();
    removeFirst();
    expect(registry.availableActions()).toEqual([second]);
    const replacement = { ...first, label: 'Find error in restored tree' };
    registry.register(replacement);
    removeFirst();
    expect(registry.availableActions()).toEqual([second, replacement]);
    removeSecond();
    expect(registry.availableActions()).toEqual([replacement]);
  });

  it('AC-6: has no root instance and keeps independently provided report registries isolated', () => {
    const Service = actionsServiceType();
    expect(TestBed.inject(Service, null)).toBeNull();
    const first = Injector.create({ providers: [Service], parent: TestBed.inject(Injector) });
    const second = Injector.create({ providers: [Service], parent: TestBed.inject(Injector) });
    try {
      first.get(Service).register(destinations()[0]);
      expect(first.get(Service).availableActions()).toHaveLength(1);
      expect(second.get(Service).availableActions()).toEqual([]);
    } finally {
      first.destroy();
      second.destroy();
    }
  });

  it('AC-5 AC-6 AC-7: shares a consumer contribution across overview and table, updates availability and blocks stale activation', fakeAsync(() => {
    const Service = actionsServiceType();
    expectInput(AltExecutionErrorsWidgetComponent, 'searchActions');
    expectInput(AltExecutionErrorsComponent, 'searchActions');
    TestBed.overrideComponent(ConsumerHostComponent, { add: { providers: [Service] } });
    const fixture = create(ConsumerHostComponent);
    const available = signal(true);
    const activate = jest.fn();
    const action = {
      id: 'additionalTree',
      label: 'Find error in additional tree',
      icon: 'tree',
      isAvailable: (): boolean => available(),
      activate,
    };
    const unregister = fixture.componentInstance._actions.register(action);
    fixture.componentInstance._destroyRef.onDestroy(unregister);
    settle(fixture);
    const overviewDebug = fixture.debugElement.query(By.directive(AltExecutionErrorsWidgetComponent));
    const tableDebug = fixture.debugElement.query(By.directive(AltExecutionErrorsComponent));
    const overview: HTMLElement = overviewDebug.nativeElement;
    const table: HTMLElement = tableDebug.nativeElement;
    const namedButtons = (element: HTMLElement): HTMLButtonElement[] =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('button')).filter(
        (candidate) =>
          candidate.getAttribute('aria-label') === action.label || candidate.textContent?.trim() === action.label,
      );
    expect(namedButtons(overview)).toHaveLength(1);
    expect(namedButtons(table)).toHaveLength(2);
    const legacyOverview = jest.fn();
    const legacyTable = jest.fn();
    (overviewDebug.componentInstance as AltExecutionErrorsWidgetComponent).searchFor.subscribe(legacyOverview);
    (tableDebug.componentInstance as AltExecutionErrorsComponent).searchFor.subscribe(legacyTable);
    namedButtons(overview)[0].click();
    expect(activate).toHaveBeenLastCalledWith(fixture.componentInstance.errors()[0]);
    const secondRow = Array.from(table.querySelectorAll<HTMLTableRowElement>('tr')).find((row) =>
      row.textContent?.includes('Second distinct error'),
    );
    expect(secondRow).toBeDefined();
    namedButtons(secondRow!)[0].click();
    expect(activate.mock.calls[1][0]).toEqual(error({ errorMessage: 'Second distinct error', errorCode: 501 }));
    expect(activate).toHaveBeenCalledTimes(2);
    expect(legacyOverview).not.toHaveBeenCalled();
    expect(legacyTable).not.toHaveBeenCalled();

    const staleOverview = namedButtons(overview)[0];
    const staleTable = namedButtons(table)[0];
    available.set(false);
    staleOverview.click();
    staleTable.click();
    expect(activate).toHaveBeenCalledTimes(2);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(0);
    expect(namedButtons(table)).toHaveLength(0);
    available.set(true);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(1);
    expect(namedButtons(table)).toHaveLength(2);
    fixture.componentInstance.errors.set([]);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(0);
    fixture.componentInstance.errors.set([error(), error({ errorMessage: 'Third error', errorCode: 503 })]);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(0);
    expect(namedButtons(table)).toHaveLength(2);
    fixture.componentInstance.errors.set([error({ errorMessage: 'Repeated selected error', count: 2 })]);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(1);
    expect(namedButtons(table)).toHaveLength(2);
    fixture.componentInstance.errors.set([error({ errorMessage: 'Current selected error' })]);
    settle(fixture);
    expect(namedButtons(overview)).toHaveLength(1);
    namedButtons(overview)[0].click();
    expect(activate).toHaveBeenLastCalledWith(fixture.componentInstance.errors()[0]);
    fixture.destroy();
    expect(fixture.componentInstance._actions.availableActions()).toEqual([]);
  }));
});
