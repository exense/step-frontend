import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NavigationEnd, provideRouter, Router, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, of, Subject } from 'rxjs';
import { TableApiWrapperService } from '../../client/step-client-module';
import { MemoryStorage } from '../basics/types/memory-storage';
import { SESSION_STORAGE } from '../basics/types/storage.token';
import { REPOSITORY_PARAMETERS } from '../repository-parameters';
import { NavigatorService } from '../routing';
import { StepMaterialModule } from '../step-material/step-material.module';
import { ItemsPerPageService } from './services/items-per-page.service';
import { STORE_ALL, tablePersistenceConfigProvider } from './services/table-persistence-config.provider';
import { TableStorageService } from './services/table-storage.service';
import { TableModule } from './table.module';

const listTemplate = `
  <step-table [dataSource]="rows">
    <ng-container matColumnDef="description" stepSearchCol>
      <th mat-header-cell *matHeaderCellDef>Description</th>
      <td mat-cell *matCellDef="let row">
        <a routerLink="/executions/A/report" queryParamsHandling="preserve">{{ row.description }}</a>
      </td>
    </ng-container>
    <ng-container matColumnDef="user" stepSearchCol>
      <th mat-header-cell *matHeaderCellDef>User</th>
      <td mat-cell *matCellDef="let row">{{ row.user }}</td>
    </ng-container>
  </step-table>
`;

@Component({
  selector: 'step-persisted-list-test',
  imports: [TableModule, StepMaterialModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tablePersistenceConfigProvider('executionList', STORE_ALL)],
  template: listTemplate,
})
class PersistedListTestComponent {
  protected readonly rows = [{ description: 'Alpha', user: 'admin' }];
}

@Component({
  selector: 'step-other-list-test',
  imports: [TableModule, StepMaterialModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tablePersistenceConfigProvider('otherList', STORE_ALL)],
  template: listTemplate,
})
class OtherListTestComponent {
  protected readonly rows = [{ description: 'Beta', user: 'other' }];
}

@Component({
  selector: 'step-report-test',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<a routerLink="/executions/list">Close execution</a>',
})
class ReportTestComponent {}

describe('Table filter navigation', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let storage: TableStorageService;
  let navigationGuard: Subject<boolean>;

  function settle(): void {
    harness.detectChanges();
    tick(250);
    harness.detectChanges();
    tick(250);
    harness.detectChanges();
  }

  function input(column: string): HTMLInputElement {
    return harness.routeNativeElement!.querySelector<HTMLInputElement>(`.mat-column-search-${column} input`)!;
  }

  function type(column: string, value: string): void {
    const field = input(column);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function stored(table = 'executionList'): unknown {
    return JSON.parse(storage.getItem(`${table}_SEARCH`) ?? '{}');
  }

  function navigate(url: string): void {
    void router.navigateByUrl(url);
    flushMicrotasks();
    settle();
  }

  function expectFilters(description: string, user: string): void {
    expect([input('description').value, input('user').value]).toEqual([description, user]);
    expect(router.parseUrl(router.url).queryParams).toEqual(
      expect.objectContaining({ tq_description: `r[${description}]`, tq_user: `r[${user}]` }),
    );
  }

  beforeEach(fakeAsync(() => {
    navigationGuard = new Subject<boolean>();
    TestBed.configureTestingModule({
      imports: [TableModule],
      providers: [
        provideRouter([
          { path: 'executions', pathMatch: 'full', redirectTo: 'executions/list' },
          { path: 'executions/list', component: PersistedListTestComponent },
          { path: 'executions/:id/report', component: ReportTestComponent },
          { path: 'other', component: OtherListTestComponent },
          { path: 'guarded', component: ReportTestComponent, canActivate: [() => navigationGuard] },
          { path: 'in-progress', component: ReportTestComponent },
        ]),
        provideLocationMocks(),
        provideNoopAnimations(),
        { provide: SESSION_STORAGE, useFactory: () => new MemoryStorage() },
        { provide: REPOSITORY_PARAMETERS, useValue: [] },
        { provide: TableApiWrapperService, useValue: { getTableSettings: () => of({ columnSettingList: [] }) } },
        {
          provide: ItemsPerPageService,
          useValue: { getItemsPerPage: () => of([10]), getDefaultPageSizeItem: () => of(10) },
        },
      ],
    });
    router = TestBed.inject(Router);
    router.setUpLocationChangeListener();
    storage = TestBed.inject(TableStorageService);
    RouterTestingHarness.create('/executions/list?tenant=Common').then((created) => (harness = created));
    flushMicrotasks();
    settle();
  }));

  afterEach(() => harness.fixture.destroy());

  it('retains two filters across report visits and sidebar reselection without leaking them to another table', fakeAsync(() => {
    type('description', 'Alpha');
    type('user', 'admin');
    settle();
    for (let i = 0; i < 3; i++) {
      harness.routeNativeElement!.querySelector<HTMLAnchorElement>('tr.content-row a')!.click();
      flushMicrotasks();
      settle();
      harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a')!.click();
      flushMicrotasks();
      settle();
      expectFilters('Alpha', 'admin');
    }

    TestBed.inject(NavigatorService).navigate('executions');
    flushMicrotasks();
    settle();
    expectFilters('Alpha', 'admin');
    expect(stored()).toEqual({ description: { value: 'Alpha', regex: true }, user: { value: 'admin', regex: true } });

    TestBed.inject(NavigatorService).navigate('other');
    flushMicrotasks();
    settle();
    expect([input('description').value, input('user').value]).toEqual(['', '']);
    expect(stored('other')).toEqual({});
    type('description', 'Beta');
    settle();
    TestBed.inject(NavigatorService).navigate('executions');
    flushMicrotasks();
    settle();
    expectFilters('Alpha', 'admin');
  }));

  it('saves valid input immediately before opening a report and keeps the last valid value for an invalid regex', fakeAsync(() => {
    type('description', 'Al');
    type('description', 'Alpha');
    expect(stored()).toEqual({ description: { value: 'Alpha', regex: true } });
    type('description', '[');
    expect(stored()).toEqual({ description: { value: 'Alpha', regex: true } });
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('tr.content-row a')!.click();
    flushMicrotasks();
    settle();
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a')!.click();
    flushMicrotasks();
    settle();
    expect(input('description').value).toBe('Alpha');
  }));

  it('honors immediate external URL changes, explicit clearing, and browser Back/Forward', fakeAsync(() => {
    navigate('/executions/list?tenant=Common&tq_description=r[Alpha]');
    type('user', 'admin');
    tick(201);
    harness.detectChanges();
    void router.navigateByUrl('/executions/list?tenant=Common&tq_description=r[Beta]');
    flushMicrotasks();
    settle();
    expect([input('description').value, input('user').value]).toEqual(['Beta', '']);

    navigate('/executions/list?tenant=Common');
    expect([input('description').value, input('user').value]).toEqual(['', '']);
    const location = TestBed.inject(Location);
    location.back();
    tick();
    settle();
    expect(input('description').value).toBe('Beta');
    location.forward();
    tick();
    settle();
    expect(input('description').value).toBe('');

    type('description', 'Alpha');
    settle();
    type('description', '');
    settle();
    navigate('/executions/A/report');
    navigate('/executions/list');
    expect(input('description').value).toBe('');
    expect(router.parseUrl(router.url).queryParams['tq_description']).toBeUndefined();
  }));

  it('cancels queued filter URL writes when navigation destroys the table', fakeAsync(() => {
    void router.navigateByUrl('/guarded?tenant=Other');
    flushMicrotasks();
    type('description', 'Alpha');
    tick(201);
    harness.detectChanges();
    navigationGuard.next(true);
    navigationGuard.complete();
    flushMicrotasks();
    settle();
    expect(router.url).toBe('/guarded?tenant=Other');
    expect(stored()).toEqual({ description: { value: 'Alpha', regex: true } });
  }));

  it('restores filters alongside tenant parameters and preserves pending input during unrelated URL updates', fakeAsync(() => {
    type('description', 'Al');
    type('user', 'admin');
    settle();
    const tenantSubscription = router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.parseUrl(router.url);
      if (!url.queryParams['tenant']) {
        url.queryParams = { ...url.queryParams, tenant: 'Common' };
        void router.navigateByUrl(url, { replaceUrl: true });
      }
    });
    navigate('/executions/A/report');
    navigate('/executions/list');
    expectFilters('Al', 'admin');
    expect(router.parseUrl(router.url).queryParams['tenant']).toBe('Common');

    type('description', 'Alpha');
    void router.navigate([], { queryParams: { display: 'compact' }, queryParamsHandling: 'merge' });
    flushMicrotasks();
    settle();
    expectFilters('Alpha', 'admin');
    expect(router.parseUrl(router.url).queryParams).toEqual({
      tenant: 'Common',
      display: 'compact',
      tq_description: 'r[Alpha]',
      tq_user: 'r[admin]',
    });
    tenantSubscription.unsubscribe();
  }));

  it.each(['cancel', 'error'])('retains queued input when navigation ends with %s', (outcome) => {
    fakeAsync(() => {
      const failure = new Error('Guard failed');
      const navigationError = jest.fn();
      void router.navigateByUrl('/guarded').catch(navigationError);
      flushMicrotasks();
      type('description', 'Alpha');
      tick(201);
      harness.detectChanges();
      if (outcome === 'error') {
        navigationGuard.error(failure);
      } else {
        navigationGuard.next(false);
        navigationGuard.complete();
      }
      flushMicrotasks();
      settle();
      expect(router.url).toContain('/executions/list?');
      expect(router.parseUrl(router.url).queryParams).toEqual({ tenant: 'Common', tq_description: 'r[Alpha]' });
      expect(input('description').value).toBe('Alpha');
      expect(stored()).toEqual({ description: { value: 'Alpha', regex: true } });
      expect(navigationError.mock.calls).toEqual(outcome === 'error' ? [[failure]] : []);
    })();
  });

  it('waits for navigation to finish before reloading the current route', fakeAsync(() => {
    void router.navigateByUrl('/guarded');
    flushMicrotasks();
    TestBed.inject(NavigatorService).reloadCurrentRoute();
    navigationGuard.next(true);
    navigationGuard.complete();
    flushMicrotasks();
    settle();
    expect(router.url).toBe('/in-progress');
    expect(TestBed.inject(Location).path()).toBe('/guarded');
    expect(router.lastSuccessfulNavigation?.extras.state).toEqual({ goTo: '/guarded' });
  }));
});
