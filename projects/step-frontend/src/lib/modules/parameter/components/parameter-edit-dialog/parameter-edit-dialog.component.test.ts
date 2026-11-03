import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AugmentedParametersService,
  AugmentedScreenService,
  AuthService,
  EntityRefDirective,
  Parameter,
  PrivateApplicationService,
  StepCoreModule,
} from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { ParameterEditDialogComponent } from './parameter-edit-dialog.component';

describe('Parameter editing permissions', () => {
  let fixture: ComponentFixture<ParameterEditDialogComponent>;
  let parameter: Parameter;
  const rights = new BehaviorSubject(new Set<string>());
  const saveParameter = jest.fn((value: Parameter) => of(value));
  const close = jest.fn();

  beforeEach(() => {
    rights.next(new Set(['param-read']));
    saveParameter.mockClear();
    close.mockClear();
    parameter = {
      id: 'parameter',
      key: 'key',
      value: { value: 'original' },
      scope: 'FUNCTION',
      scopeEntity: 'Keyword',
    };
    TestBed.configureTestingModule({
      imports: [StepCoreModule, EntityRefDirective],
      declarations: [ParameterEditDialogComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { entity: parameter, isNew: false } },
        { provide: MatDialogRef, useValue: { close } },
        { provide: AugmentedParametersService, useValue: { saveParameter } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        {
          provide: AuthService,
          useValue: {
            getConf: () => ({}),
            hasRight: (right: string) => rights.value.has(right),
            hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))),
          },
        },
        {
          provide: AugmentedScreenService,
          useValue: { getInputForScreen: () => of(undefined), getScreenInputsByScreenIdWithCache: () => of([]) },
        },
      ],
    });
  });

  afterEach(() => fixture?.destroy());

  function render(): HTMLButtonElement {
    fixture = TestBed.createComponent(ParameterEditDialogComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(
      (button) => button.textContent?.trim() === 'Save',
    )!;
  }

  it('allows viewing a non-global parameter but prevents saving by button or Enter without param-write', fakeAsync(() => {
    const save = render();
    expect(fixture.nativeElement.querySelector('input[name="key"]').value).toBe('key');
    expect(save.disabled).toBe(true);
    save.click();
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    tick();
    expect(saveParameter).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();

    rights.next(new Set(['param-read', 'param-write']));
    fixture.detectChanges();
    expect(save.disabled).toBe(false);
    save.click();
    expect(saveParameter).toHaveBeenCalledWith(parameter);
    expect(close).toHaveBeenCalledWith({ isSuccess: true });
  }));

  it('requires both parameter-write rights to save a global parameter', fakeAsync(() => {
    parameter.scope = 'GLOBAL';
    rights.next(new Set(['param-read', 'param-global-write']));
    const save = render();
    expect(save.disabled).toBe(true);
    rights.next(new Set(['param-read', 'param-write']));
    fixture.detectChanges();
    expect(save.disabled).toBe(true);
    rights.next(new Set(['param-read', 'param-write', 'param-global-write']));
    fixture.detectChanges();
    expect(save.disabled).toBe(false);
    save.click();
    expect(saveParameter).toHaveBeenCalledWith(parameter);
  }));
});
