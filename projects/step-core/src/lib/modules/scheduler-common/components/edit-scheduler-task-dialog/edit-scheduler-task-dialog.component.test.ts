import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, map, of } from 'rxjs';
import {
  AugmentedScreenService,
  PrivateApplicationService,
  provideTestStepApi,
} from '../../../../client/step-client-module';
import { AuthService } from '../../../auth';
import { ScreenDataMetaService } from '../../../basics/injectables/screen-data-meta.service';
import { EditSchedulerTaskDialogComponent } from './edit-scheduler-task-dialog.component';

describe('Schedule dialog permissions', () => {
  let fixture: ComponentFixture<EditSchedulerTaskDialogComponent>;
  let http: HttpTestingController;
  const rights = new BehaviorSubject(new Set(['plan-execute']));

  beforeEach(() => {
    rights.next(new Set(['plan-execute']));
    TestBed.configureTestingModule({
      imports: [EditSchedulerTaskDialogComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideTestStepApi(),
        provideHttpClientTesting(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            isSchedulePlan: true,
            taskAndConfig: {
              task: {
                attributes: { name: 'Schedule' },
                cronExpression: '0 0 * * * ?',
                active: true,
                executionsParameters: {
                  mode: 'RUN',
                  repositoryObject: { repositoryID: 'local', repositoryParameters: { planid: 'plan' } },
                  customParameters: {},
                },
              },
              config: {
                hideUser: true,
                plan: { id: 'plan', attributes: { name: 'Plan' }, root: { _class: 'Sequence' } },
              },
            },
          },
        },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        {
          provide: AuthService,
          useValue: {
            hasRight: (right: string) => rights.value.has(right),
            hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))),
            getConf: () => ({}),
          },
        },
        { provide: AugmentedScreenService, useValue: { getScreenInputsByScreenIdWithCache: () => of([]) } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: ScreenDataMetaService, useValue: { checkMetaInformationAboutScreenInRoute: () => undefined } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  it('requires task-write in schedule-plan mode for both Save and Enter, then saves a valid authorized schedule', fakeAsync(() => {
    fixture = TestBed.createComponent(EditSchedulerTaskDialogComponent);
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const save = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(
      (button) => button.textContent?.trim() === 'Save',
    )!;
    expect(save.disabled).toBe(true);
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    tick();
    http.expectNone((request) => request.url.endsWith('/scheduler/task'));
    rights.next(new Set(['plan-execute', 'task-write']));
    fixture.detectChanges();
    expect(save.disabled).toBe(false);
    save.click();
    tick(500);
    const request = http.expectOne((value) => value.url.endsWith('/scheduler/task'));
    const payload = JSON.parse(request.request.body);
    expect(payload.attributes.name).toBe('Schedule');
    request.flush({ id: 'task' });
    tick();
  }));
});
