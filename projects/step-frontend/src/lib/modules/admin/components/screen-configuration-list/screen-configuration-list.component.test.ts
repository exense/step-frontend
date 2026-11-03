import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import {
  AugmentedScreenService,
  AuthService,
  DashletRegistryService,
  DialogsService,
  EntityColumnComponent,
  EntityRefDirective,
  PrivateApplicationService,
  StepCoreModule,
  TableApiWrapperService,
  UserService,
} from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { RenderOptionsPipe } from '../../pipes/render-options.pipe';
import { ScreenConfigurationListComponent } from './screen-configuration-list.component';

describe('Model field deletion permissions', () => {
  let fixture: ComponentFixture<ScreenConfigurationListComponent>;
  const rights = new BehaviorSubject(new Set(['screenInputs-write']));
  const deleteInput = jest.fn(() => of(undefined));

  beforeEach(() => {
    rights.next(new Set(['screenInputs-write']));
    deleteInput.mockClear();
    TestBed.configureTestingModule({
      imports: [StepCoreModule, EntityRefDirective],
      declarations: [ScreenConfigurationListComponent, RenderOptionsPipe],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        RenderOptionsPipe,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ availableScreens: ['keyword'] }),
            params: of({ screenId: 'keyword' }),
            snapshot: {},
            routeConfig: { path: 'model' },
          },
        },
        {
          provide: AuthService,
          useValue: { hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))) },
        },
        {
          provide: AugmentedScreenService,
          useValue: {
            getScreenInputsByScreenId: () =>
              of([{ id: 'field', input: { id: 'field', label: 'Field', type: 'TEXT' } }]),
            deleteInput,
          },
        },
        { provide: DialogsService, useValue: { showDeleteWarning: () => of(true) } },
        { provide: UserService, useValue: { getPreferences: () => of({}) } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: TableApiWrapperService, useValue: { getTableSettings: () => of({ columnSettingList: [] }) } },
      ],
    });
    TestBed.inject(DashletRegistryService).registerDashlet('entityColumn', EntityColumnComponent);
  });

  afterEach(() => fixture?.destroy());

  it('permits editing fields with write permission while requiring delete permission to remove them', fakeAsync(() => {
    fixture = TestBed.createComponent(ScreenConfigurationListComponent);
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const remove: HTMLButtonElement = fixture.nativeElement.querySelector('[stepTestId="delete-screen-btn"]');
    expect(remove).not.toBeNull();
    expect(remove.disabled).toBe(true);
    remove.click();
    expect(deleteInput).not.toHaveBeenCalled();
    rights.next(new Set(['screenInputs-delete']));
    fixture.detectChanges();
    expect(remove.disabled).toBe(false);
    remove.click();
    expect(deleteInput).toHaveBeenCalledWith('field', 'keyword');
  }));
});
