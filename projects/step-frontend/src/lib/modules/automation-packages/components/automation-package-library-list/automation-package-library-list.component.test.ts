import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AugmentedResourcesService,
  AuthService,
  DashletRegistryService,
  EntityColumnComponent,
  DialogsService,
  PrivateApplicationService,
  provideTestStepApi,
  TableApiWrapperService,
  TableFetchLocalDataSource,
  UserService,
} from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { AutomationPackageLibraryListComponent } from './automation-package-library-list.component';

describe('Automation package library permissions', () => {
  let fixture: ComponentFixture<AutomationPackageLibraryListComponent>;
  let http: HttpTestingController;
  const rights = new BehaviorSubject(new Set(['resource-read', 'resource-write', 'resource-delete']));

  beforeEach(() => {
    rights.next(new Set(['resource-read', 'resource-write', 'resource-delete']));
    TestBed.configureTestingModule({
      imports: [AutomationPackageLibraryListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideTestStepApi(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))),
            getConf: () => ({}),
          },
        },
        { provide: DialogsService, useValue: { showDeleteWarning: () => of(true) } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: UserService, useValue: { getPreferences: () => of({}) } },
        { provide: TableApiWrapperService, useValue: { getTableSettings: () => of({ columnSettingList: [] }) } },
      ],
    });
    jest.spyOn(TestBed.inject(AugmentedResourcesService), 'createDataSource').mockReturnValue(
      new TableFetchLocalDataSource(() =>
        of([
          {
            id: 'library',
            attributes: { name: 'Library' },
            resourceName: 'Library',
            resourceType: 'automationPackageLibrary',
          },
        ]),
      ),
    );
    TestBed.inject(DashletRegistryService).registerDashlet('entityColumn', EntityColumnComponent);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  it('requires automation-package rights for upload, refresh and deletion instead of generic resource rights', fakeAsync(() => {
    fixture = TestBed.createComponent(AutomationPackageLibraryListComponent);
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const upload: HTMLAnchorElement = fixture.nativeElement.querySelector('[data-step-testid="new-library-btn"]');
    const refresh: HTMLButtonElement = fixture.nativeElement.querySelector('[data-step-testid="refresh-library-btn"]');
    const remove: HTMLButtonElement = fixture.nativeElement.querySelector('[data-step-testid="delete-library-btn"]');
    expect(refresh).not.toBeNull();
    expect(refresh.disabled).toBe(true);
    expect(remove.disabled).toBe(true);
    expect(upload.getAttribute('aria-disabled')).toBe('true');
    rights.next(new Set(['automation-package-read', 'automation-package-write', 'automation-package-delete']));
    fixture.detectChanges();
    expect(refresh.disabled).toBe(false);
    expect(remove.disabled).toBe(false);
    expect(upload.getAttribute('aria-disabled')).not.toBe('true');
    refresh.click();
    tick();
    http.expectOne((request) => request.url.endsWith('/automation-packages/resources/library/refresh')).flush({});
    tick();
    remove.click();
    tick();
    const request = http.expectOne((value) => value.url.endsWith('/automation-packages/resources/library'));
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    tick();
  }));
});
