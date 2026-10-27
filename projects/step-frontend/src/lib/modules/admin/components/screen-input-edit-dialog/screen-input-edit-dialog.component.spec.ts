import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { provideTestStepApi, ScreenInput } from '@exense/step-core';
import { of } from 'rxjs';
import { ScreenInputEditDialogComponent } from './screen-input-edit-dialog.component';

describe('Screen input editing', () => {
  let http: HttpTestingController;
  const dialog = { close: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    http.verify();
  });

  function openDialog(
    screenInput: ScreenInput,
    queryParams: Record<string, string> = {},
  ): ScreenInputEditDialogComponent {
    TestBed.configureTestingModule({
      providers: [
        provideTestStepApi(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { screenInput } },
        { provide: MatDialogRef, useValue: dialog },
        { provide: ActivatedRoute, useValue: { queryParams: of(queryParams) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.runInInjectionContext(() => new ScreenInputEditDialogComponent());
  }

  it('keeps the stored position when saving an edited input without a next index', fakeAsync(() => {
    const screenInput: ScreenInput = {
      id: 'checkbox-input',
      screenId: 'executionParameters',
      position: 2,
      input: { id: 'c', label: 'c', type: 'CHECKBOX' },
    };
    const component = openDialog(screenInput);
    screenInput.input!.id = 'c2';

    component['save']();
    flushMicrotasks();

    const save = http.expectOne((request) => request.method === 'POST' && request.url.endsWith('/screens/input'));
    const savedInput: ScreenInput = JSON.parse(save.request.body);
    save.flush(null);
    expect(savedInput).toEqual({ ...screenInput, position: 2 });
    expect(savedInput.input!.id).toBe('c2');
    expect(dialog.close).toHaveBeenCalledWith({ isSuccess: true });
  }));

  it('assigns the next position when saving a new input', fakeAsync(() => {
    const component = openDialog(
      { screenId: 'executionParameters', input: { id: 'new', type: 'TEXT' } },
      { nextIndex: '3' },
    );

    component['save']();
    flushMicrotasks();

    const save = http.expectOne((request) => request.method === 'POST' && request.url.endsWith('/screens/input'));
    const savedInput: ScreenInput = JSON.parse(save.request.body);
    save.flush(null);
    expect(savedInput.position).toBe(3);
    expect(dialog.close).toHaveBeenCalledWith({ isSuccess: true });
  }));
});
