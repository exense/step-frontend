import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  DEFAULT_PAGE,
  dialogRoute,
  DialogsService,
  HttpOverrideResponseInterceptorService,
  IdeService,
  LOCAL_STORAGE,
  NAVIGATOR_QUERY_PARAMS_CLEANUP,
  ReloadableDirective,
  StepBasicsModule,
} from '@exense/step-core';
import { defer, of } from 'rxjs';
import { InProgressComponent } from '../../../../components/in-progress/in-progress.component';
import { IdeStateService } from './ide-state.service';

@Component({
  selector: 'step-package-plan-probe',
  template: '{{ planName }}',
  hostDirectives: [ReloadableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PackagePlanProbeComponent {
  protected readonly planName = inject(ActivatedRoute).snapshot.data['planName'];
}

@Component({
  selector: 'step-package-keyword-probe',
  template: '{{ keywordName }}',
  hostDirectives: [ReloadableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PackageKeywordProbeComponent {
  protected readonly keywordName = inject(MAT_DIALOG_DATA)['keywordName'];
}

@Component({ selector: 'step-package-home-probe', template: '' })
class PackageHomeProbeComponent {}

describe('IDE package navigation', () => {
  const packageDescriptor = { directory: '/review/package', name: 'Review package' };
  let packageAvailable: boolean;
  let allowLeave: boolean;
  let closeUrl: string | undefined;
  let replacementUrl: string | undefined;
  let packageReplaced: boolean;
  let keywordsOpenAtReplacement: number;
  let readsAfterClose: string[];
  let readsAfterReplacement: string[];
  let router: Router;
  const api = {
    getCurrentAp: jest.fn(() => of(packageAvailable ? packageDescriptor : undefined)),
    closeAp: jest.fn(() =>
      defer(() => {
        closeUrl = router.url;
        packageAvailable = false;
        return of(null);
      }),
    ),
    useExistingAp: jest.fn(() =>
      defer(() => {
        replacementUrl = router.url;
        keywordsOpenAtReplacement = TestBed.inject(MatDialog).openDialogs.length;
        packageReplaced = true;
        packageAvailable = true;
        return of(null);
      }),
    ),
  };

  beforeEach(() => {
    packageAvailable = true;
    allowLeave = true;
    closeUrl = undefined;
    replacementUrl = undefined;
    packageReplaced = false;
    keywordsOpenAtReplacement = 0;
    readsAfterClose = [];
    readsAfterReplacement = [];
    jest.clearAllMocks();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule, StepBasicsModule],
      providers: [
        provideRouter([
          ...['plans/editor/:id', 'executions/:id', 'composites/editor/:id'].map((path) => ({
            path,
            component: PackagePlanProbeComponent,
            canDeactivate: [() => allowLeave],
            resolve: {
              planName: (route: ActivatedRouteSnapshot) => {
                if (!packageAvailable) {
                  readsAfterClose.push(route.params['id']);
                }
                if (packageReplaced) {
                  readsAfterReplacement.push(route.params['id']);
                  return "Plan doesn't exist";
                }
                return 'Review plan';
              },
            },
          })),
          dialogRoute({
            path: 'functions/configure/:id',
            dialogComponent: PackageKeywordProbeComponent,
            resolve: {
              keywordName: (route: ActivatedRouteSnapshot) => {
                if (packageReplaced) {
                  readsAfterReplacement.push(route.params['id']);
                  return "Keyword doesn't exist";
                }
                return 'Review keyword';
              },
            },
          }),
          { path: 'plans/list', component: PackageHomeProbeComponent },
          { path: 'studio', component: PackageHomeProbeComponent },
          {
            path: 'in-progress',
            component: InProgressComponent,
            resolve: { goTo: () => router.getCurrentNavigation()?.extras.state?.['goTo'] },
          },
        ]),
        { provide: IdeService, useValue: api },
        { provide: DialogsService, useValue: {} },
        { provide: HttpOverrideResponseInterceptorService, useValue: { overrideInterceptor: jest.fn() } },
        { provide: LOCAL_STORAGE, useValue: localStorage },
        { provide: DEFAULT_PAGE, useValue: () => '/plans/list' },
        { provide: NAVIGATOR_QUERY_PARAMS_CLEANUP, useValue: [] },
      ],
    });
    router = TestBed.inject(Router);
  });

  const openEditor = (url = '/plans/editor/plan-one?artefactId=child'): RouterTestingHarness => {
    const state = TestBed.inject(IdeStateService);
    state.initialize();
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create(url).then((result) => (harness = result));
    flush();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toBe('Review plan');
    return harness;
  };

  it.each([
    ['plan editor', '/plans/editor/plan-one?artefactId=child'],
    ['execution report', '/executions/execution-one?nodeId=child'],
    ['composite keyword editor', '/composites/editor/keyword-one?artefactId=child'],
  ])(
    'leaves the %s before reloading its package without revisiting stale references',
    fakeAsync((_view: string, url: string) => {
      const harness = openEditor(url);
      const state = TestBed.inject(IdeStateService);
      state.reload();
      flush();
      harness.detectChanges();
      flush();
      harness.detectChanges();

      expect(readsAfterReplacement).toEqual([]);
      expect(replacementUrl).toBe('/studio');
      expect(router.url).toBe('/plans/list');
      expect(api.useExistingAp).toHaveBeenCalledTimes(1);
      expect(api.useExistingAp).toHaveBeenCalledWith(packageDescriptor.directory);
      expect(state.currentPackage()).toEqual(packageDescriptor);
      expect(state.inProgress()).toBe(false);
      expect(harness.routeNativeElement?.textContent).not.toContain("Plan doesn't exist");
    }),
  );

  it('closes the keyword configuration dialog before reloading without reopening its stale reference', fakeAsync(() => {
    const state = TestBed.inject(IdeStateService);
    state.initialize();
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create('/functions/configure/keyword-one').then((result) => (harness = result));
    flush();
    harness.detectChanges();
    tick(100);
    flush();
    harness.detectChanges();
    const dialogs = TestBed.inject(MatDialog);
    expect(router.url).toBe('/functions/configure/keyword-one');
    expect(dialogs.openDialogs).toHaveLength(1);
    expect(document.body.textContent).toContain('Review keyword');

    state.reload();
    flush();
    harness.detectChanges();
    tick(100);
    flush();
    harness.detectChanges();

    expect(readsAfterReplacement).toEqual([]);
    expect(keywordsOpenAtReplacement).toBe(0);
    expect(dialogs.openDialogs).toHaveLength(0);
    expect(document.body.textContent).not.toContain('Review keyword');
    expect(router.url).toBe('/plans/list');
    expect(state.currentPackage()).toEqual(packageDescriptor);
    expect(state.inProgress()).toBe(false);
  }));

  it('retains the package and editor when leaving for a reload is cancelled', fakeAsync(() => {
    const harness = openEditor();
    const state = TestBed.inject(IdeStateService);
    allowLeave = false;
    state.reload();
    flush();
    harness.detectChanges();
    flush();
    harness.detectChanges();

    expect(api.useExistingAp).not.toHaveBeenCalled();
    expect(router.url).toBe('/plans/editor/plan-one?artefactId=child');
    expect(state.currentPackage()).toEqual(packageDescriptor);
    expect(state.inProgress()).toBe(false);
    expect(harness.routeNativeElement?.textContent).toBe('Review plan');
  }));

  it('leaves the editor before closing its package and opens a fresh list when reopening', fakeAsync(() => {
    const harness = openEditor();
    const state = TestBed.inject(IdeStateService);
    state.close();
    flush();
    harness.detectChanges();
    flush();
    harness.detectChanges();

    expect(readsAfterClose).toEqual([]);
    expect(closeUrl).toBe('/studio');
    expect(router.url).toBe('/studio');
    expect(state.currentPackage()).toBeUndefined();
    expect(state.inProgress()).toBe(false);
    expect(harness.routeNativeElement?.textContent).not.toContain('Review plan');

    state.openFromPath(packageDescriptor.directory);
    flush();
    harness.detectChanges();
    expect(router.url).toBe('/plans/list');
    expect(state.currentPackage()).toEqual(packageDescriptor);
    expect(readsAfterClose).toEqual([]);
  }));

  it('retains the package and editor when navigation is cancelled', fakeAsync(() => {
    const harness = openEditor();
    const state = TestBed.inject(IdeStateService);
    allowLeave = false;
    state.close();
    flush();
    harness.detectChanges();
    flush();
    harness.detectChanges();

    expect(api.closeAp).not.toHaveBeenCalled();
    expect(router.url).toBe('/plans/editor/plan-one?artefactId=child');
    expect(state.currentPackage()).toEqual(packageDescriptor);
    expect(state.inProgress()).toBe(false);
    expect(harness.routeNativeElement?.textContent).toBe('Review plan');
  }));
});
