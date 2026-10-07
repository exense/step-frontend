import { Component, inject } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import {
  DEFAULT_PAGE,
  DialogsService,
  HttpOverrideResponseInterceptorService,
  IdeService,
  LOCAL_STORAGE,
  NAVIGATOR_QUERY_PARAMS_CLEANUP,
  ReloadableDirective,
} from '@exense/step-core';
import { defer, of } from 'rxjs';
import { InProgressComponent } from '../../../../components/in-progress/in-progress.component';
import { IdeStateService } from './ide-state.service';

@Component({
  selector: 'step-package-plan-probe',
  template: '{{ planName }}',
  hostDirectives: [ReloadableDirective],
})
class PackagePlanProbeComponent {
  protected readonly planName = inject(ActivatedRoute).snapshot.data['planName'];
}

@Component({ selector: 'step-package-home-probe', template: '' })
class PackageHomeProbeComponent {}

describe('IDE package navigation', () => {
  const packageDescriptor = { directory: '/review/package', name: 'Review package' };
  let packageAvailable: boolean;
  let allowLeave: boolean;
  let closeUrl: string | undefined;
  let readsAfterClose: string[];
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
        packageAvailable = true;
        return of(null);
      }),
    ),
  };

  beforeEach(() => {
    packageAvailable = true;
    allowLeave = true;
    closeUrl = undefined;
    readsAfterClose = [];
    jest.clearAllMocks();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'plans/editor/:id',
            component: PackagePlanProbeComponent,
            canDeactivate: [() => allowLeave],
            resolve: {
              planName: (route: ActivatedRouteSnapshot) => {
                if (!packageAvailable) {
                  readsAfterClose.push(route.params['id']);
                }
                return 'Review plan';
              },
            },
          },
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
        { provide: MatDialog, useValue: {} },
        { provide: HttpOverrideResponseInterceptorService, useValue: { overrideInterceptor: jest.fn() } },
        { provide: LOCAL_STORAGE, useValue: localStorage },
        { provide: DEFAULT_PAGE, useValue: () => '/plans/list' },
        { provide: NAVIGATOR_QUERY_PARAMS_CLEANUP, useValue: [] },
      ],
    });
    router = TestBed.inject(Router);
  });

  const openEditor = (): RouterTestingHarness => {
    const state = TestBed.inject(IdeStateService);
    state.initialize();
    let harness!: RouterTestingHarness;
    RouterTestingHarness.create('/plans/editor/plan-one?artefactId=child').then((result) => (harness = result));
    flush();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toBe('Review plan');
    return harness;
  };

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
