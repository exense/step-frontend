import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AugmentedScreenService,
  AuthService,
  DEFAULT_PAGE,
  DialogRouteResult,
  EntityRefDirective,
  FunctionConfigurationApiService,
  FunctionConfigurationDialogData,
  FunctionType,
  FunctionTypeFormComponent,
  FunctionTypeRegistryService,
  Keyword,
  PrivateApplicationService,
  ScreenDataMetaService,
  StepCoreModule,
} from '@exense/step-core';
import { of } from 'rxjs';
import { FunctionConfigurationDialogComponent } from './function-configuration-dialog.component';

@Component({
  selector: 'step-test-function-type',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestFunctionTypeComponent extends FunctionTypeFormComponent<FormGroup> {
  protected readonly formGroup = inject(FormBuilder).group({});

  // eslint-disable-next-line step-lint/component-public-fields -- FunctionTypeFormComponent calls this public hook in ngAfterViewInit.
  override setValueToForm(): void {}

  // eslint-disable-next-line step-lint/component-public-fields -- The configuration dialog calls this public FunctionTypeFormComponent hook when saving.
  override setValueToModel(): void {}
}

describe('Keyword configuration without an editor', () => {
  const api = {
    saveFunction: jest.fn((keyword: Keyword) => of(keyword)),
    getFunctionEditor: jest.fn(() => of('')),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [StepCoreModule, EntityRefDirective, NoopAnimationsModule],
      declarations: [FunctionConfigurationDialogComponent],
      providers: [
        provideRouter([]),
        { provide: FunctionConfigurationApiService, useValue: api },
        { provide: AuthService, useValue: { getConf: () => ({}), hasRight$: () => of(true) } },
        { provide: AugmentedScreenService, useValue: { getScreenInputsByScreenIdWithCache: () => of([]) } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: ScreenDataMetaService, useValue: { checkMetaInformationAboutScreenInRoute: () => undefined } },
        { provide: DEFAULT_PAGE, useValue: () => '/functions/list' },
      ],
    });
    TestBed.inject(FunctionTypeRegistryService).register(FunctionType.SCRIPT, 'Script', TestFunctionTypeComponent);
  });

  afterEach(fakeAsync(() => {
    TestBed.inject(MatDialog).closeAll();
    flush();
  }));

  it('shows one warning, waits for dismissal, then closes the saved configuration', fakeAsync(() => {
    const dialogs = TestBed.inject(MatDialog);
    const application = TestBed.inject(ApplicationRef);
    const data: FunctionConfigurationDialogData = {
      keyword: { id: 'script-keyword', type: FunctionType.SCRIPT, attributes: { name: 'Java keyword' } },
      dialogConfig: {
        title: 'Keyword',
        functionTypeFilters: [FunctionType.SCRIPT],
        lightForm: true,
        customScreenTable: 'keyword',
        writePermission: 'kw-write',
      },
    };
    const configuration = dialogs.open<
      FunctionConfigurationDialogComponent,
      FunctionConfigurationDialogData,
      DialogRouteResult
    >(FunctionConfigurationDialogComponent, { data });
    const closed = jest.fn();
    configuration.afterClosed().subscribe(closed);
    application.tick();
    tick(500);
    application.tick();

    const saveAndEdit = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === 'Save and edit',
    )!;
    expect(saveAndEdit.disabled).toBe(false);
    saveAndEdit.click();
    flush();
    application.tick();

    expect(api.saveFunction).toHaveBeenCalledTimes(1);
    expect(api.getFunctionEditor).toHaveBeenCalledWith('script-keyword');
    expect(dialogs.openDialogs).toHaveLength(2);
    expect(closed).not.toHaveBeenCalled();
    expect(document.querySelector('step-message-dialog')?.textContent).toContain(
      'No editor configured for this function type',
    );

    document.querySelector<HTMLButtonElement>('step-message-dialog button[type="submit"]')!.click();
    flush();
    application.tick();

    expect(dialogs.openDialogs).toHaveLength(0);
    expect(document.querySelector('step-message-dialog')).toBeNull();
    expect(closed).toHaveBeenCalledWith({ isSuccess: true, canNavigateBack: true });
  }));
});
