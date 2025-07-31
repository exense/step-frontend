import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  AugmentedControllerService,
  AugmentedSchedulerService,
  ExecutiontTaskParameters,
  Plan,
  RepositoryObjectReference,
} from '../../../../client/step-client-module';
import { CronEditorTab, CronService } from '../../../cron/cron.module';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.constant';
import { CustomFormWrapperComponent } from '../../../custom-forms';
import { DialogRouteResult } from '../../../basics/step-basics.module';
import { SelectPlanComponent } from '../../../plan-common';
import {
  EXCLUSION_ID,
  TaskCronExclusionForm,
  taskCronExclusionFormCreate,
  taskForm2Model,
  taskFormCreate,
  taskModel2Form,
} from './task.form';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { KeyValue } from '@angular/common';
import { JSON_FORM_EXPORTS, JsonFieldsSchema, JsonFieldUtilsService } from '../../../json-forms';
import { RepositoryParametersSchemasService } from '../../../repository-parameters';
import { LIST_SELECTION_EXPORTS, SelectAll } from '../../../list-selection';
import { catchError } from 'rxjs/operators';
import { HasRightPipe } from '../../../auth';

type EditDialogRef = MatDialogRef<EditSchedulerTaskDialogComponent, DialogRouteResult>;

export interface EditSchedulerTaskDialogConfig {
  disablePlan?: boolean;
  disableUser?: boolean;
  hideUser?: boolean;
  plan?: Plan;
  forbiddenPlanError?: string;
}

export interface EditSchedulerTaskDialogData {
  taskAndConfig: {
    task: ExecutiontTaskParameters;
    config?: EditSchedulerTaskDialogConfig;
  };
}

const LOCAL_REPOSITORY_ID = 'local';

@Component({
  selector: 'step-scheduled-task-edit-dialog',
  templateUrl: './edit-scheduler-task-dialog.component.html',
  styleUrls: ['./edit-scheduler-task-dialog.component.scss'],
  standalone: true,
  imports: [
    SCHEDULER_COMMON_IMPORTS,
    CustomFormWrapperComponent,
    SelectPlanComponent,
    JSON_FORM_EXPORTS,
    LIST_SELECTION_EXPORTS,
    HasRightPipe,
  ],
  host: {
    '(keydown.enter)': 'save()',
  },
})
export class EditSchedulerTaskDialogComponent implements OnInit, AfterViewInit {
  readonly EXCLUSION_HELP_MESSAGE =
    'Optionally provide CRON expression(s) for excluding time ranges. (Example: for a schedule set to run every 5 minutes, you can exclude the execution on weekends with “* * * ? * SAT-SUN” )';

  private _cron = inject(CronService);
  private _api = inject(AugmentedSchedulerService);
  private _controllerApi = inject(AugmentedControllerService);
  private _destroyRef = inject(DestroyRef);
  private _matDialogRef = inject<EditDialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder);
  private _jsonFieldUtils = inject(JsonFieldUtilsService);
  private _repositoryParamsSchemas = inject(RepositoryParametersSchemasService);
  private _dialogData = inject<EditSchedulerTaskDialogData>(MAT_DIALOG_DATA).taskAndConfig;
  private _cd = inject(ChangeDetectorRef);

  private config = this._dialogData.config;

  private customForms = viewChild(CustomFormWrapperComponent);

  protected task = this._dialogData.task;

  protected hideUser = this.config?.hideUser;

  protected showProgress = signal(false);
  protected isNew = signal(true);
  protected error = signal('');

  protected readonly EXCLUSION_ID = EXCLUSION_ID;
  protected taskForm = taskFormCreate(this._fb);
  protected cronExclusions = this.taskForm.controls.cronExclusions;

  private hasExclusions$ = this.cronExclusions.valueChanges.pipe(
    startWith(this.cronExclusions.value),
    map((exclusions) => !!exclusions.length),
    takeUntilDestroyed(),
  );

  protected showParameters = model(false);
  protected paramsSchema = signal<JsonFieldsSchema | undefined>(undefined);
  protected isLocal = signal(false);
  protected hasExclusions = toSignal(this.hasExclusions$);

  private testCases$ = this.createTestCasesStream();

  protected testCasesWithIds = toSignal(this.testCases$.pipe(map((testCases) => testCases.testCasesWithIds)));

  protected testCasesNamesOnly = toSignal(this.testCases$.pipe(map((testCases) => testCases.testCasesNamesOnly)));

  ngOnInit(): void {
    this.initializeTask();
  }

  ngAfterViewInit(): void {
    this.addCustomErrors();
  }

  protected save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    taskForm2Model(this.task, this.taskForm);
    this.error.set('');
    this.customForms()!
      .readyToProceed()
      .pipe(switchMap(() => this._api.saveExecutionTask(this.task)))
      .subscribe({
        next: (task) => this._matDialogRef.close({ isSuccess: !!task }),
        error: () => {
          this.error.set('Invalid CRON expression or server error.');
        },
      });
  }

  protected configureCronExpression(): void {
    this._cron.configureExpression().subscribe((expression) => {
      if (expression) {
        this.taskForm.controls.cron.setValue(expression);
      }
    });
  }

  protected addCronExclusion(): void {
    this.taskForm.controls.cronExclusions.push(taskCronExclusionFormCreate(this._fb));
  }

  protected removeExclusion(index: number) {
    this.taskForm.controls.cronExclusions.removeAt(index);
  }

  protected configureCronExpressionForExclusion(exclusionForm: TaskCronExclusionForm): void {
    this._cron
      .configureExpression(CronEditorTab.TIME_RANGE, CronEditorTab.WEEKLY_TIME_RANGE, CronEditorTab.ANY_DAY_TIME_RANGE)
      .subscribe((expression) => {
        if (expression) {
          exclusionForm.controls.cron.setValue(expression);
        }
      });
  }

  private initializeTask(): void {
    if (this.config?.disablePlan) {
      this.taskForm.controls.plan.disable();
    }
    if (this.config?.disableUser) {
      this.taskForm.controls.userID.disable();
    }
    taskModel2Form(this.task, this.taskForm, this._fb, this.config?.plan);
    const repositoryId = this.taskForm.controls.repositoryId.value;
    this.isNew.set(!this.taskForm.controls.name.value);
    this.isLocal.set(repositoryId === LOCAL_REPOSITORY_ID);
    this.paramsSchema.set(
      this._repositoryParamsSchemas.getSchema(repositoryId!) ?? {
        properties: {},
      },
    );
    this.taskForm.markAsUntouched();
    this.taskForm.markAsPristine();
  }

  private addCustomErrors(): void {
    const forbidden = this.config?.forbiddenPlanError;
    if (!forbidden) {
      return;
    }
    // FormGroup directive will invoke `updateValueAndValidity` when new form object will be assigned
    // it will erase all custom errors.
    // Zero timeout has been added, to put error after FormGroup's `updateValueAndValidity` invocation
    setTimeout(() => {
      this.taskForm.controls.plan.setErrors({ forbidden });
      this.taskForm.controls.plan.markAsTouched();
    }, 0);
  }

  private createTestCasesStream() {
    const getChangeStream = <T>(control: FormControl<T>) => control.valueChanges.pipe(startWith(control.value));

    const repositoryID$ = getChangeStream(this.taskForm.controls.repositoryId);
    const repositoryParameters$ = getChangeStream(this.taskForm.controls.repositoryParameters).pipe(debounceTime(300));
    const plan$ = getChangeStream(this.taskForm.controls.plan);
    const includedRepositoryIds$ = getChangeStream(this.taskForm.controls.includedRepositoryIds);

    return combineLatest([repositoryID$, repositoryParameters$, plan$, includedRepositoryIds$]).pipe(
      map(([repositoryID, repositoryParameters, plan, includedRepositoryIds]) => {
        if (!repositoryID) {
          return undefined;
        }

        switch (repositoryID) {
          case LOCAL_REPOSITORY_ID:
            if (!!includedRepositoryIds?.length || plan?.root?._class === 'TestSet') {
              return {
                repositoryID,
                repositoryParameters: {
                  ...repositoryParameters,
                  planid: plan!.id!,
                },
              } as RepositoryObjectReference;
            }
            return undefined;
          default:
            return {
              repositoryID,
              repositoryParameters,
            } as RepositoryObjectReference;
        }
      }),
      distinctUntilChanged(
        (a, b) =>
          a === b ||
          (a?.repositoryID === b?.repositoryID &&
            this._jsonFieldUtils.areObjectsEqual(a?.repositoryParameters, b?.repositoryParameters)),
      ),
      switchMap((repositoryRef) => {
        if (!repositoryRef) {
          return of(undefined);
        }
        this.showProgress.set(true);
        return this._controllerApi.getReport(repositoryRef).pipe(
          catchError(() => of(undefined)),
          map((items) => (!items?.runs?.length ? undefined : items)),
          map((overview) =>
            overview?.runs?.map((item) => {
              const key = repositoryRef.repositoryID === LOCAL_REPOSITORY_ID ? item.id : undefined;
              const value = item.testplanName;
              return { key, value } as KeyValue<string, string>;
            }),
          ),
          finalize(() => this.showProgress.set(false)),
        );
      }),
      tap((items) => {
        if (!items?.length) {
          this.taskForm.controls.includedRepositoryIds.setValue(null, { emitEvent: false });
          this.taskForm.controls.includedRepositoryNames.setValue(null, { emitEvent: false });
        }
      }),
      map((items) => {
        let testCasesWithIds = items?.filter((item) => !!item.key);
        let testCasesNamesOnly = items
          ?.filter((item) => !item.key)
          ?.map(({ value }) => ({ key: value, value }) as KeyValue<string, string>);

        testCasesWithIds = !!testCasesWithIds?.length ? testCasesWithIds : undefined;
        testCasesNamesOnly = !!testCasesNamesOnly?.length ? testCasesNamesOnly : undefined;

        return {
          testCasesWithIds,
          testCasesNamesOnly,
        };
      }),
      shareReplay(1),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  protected readonly SelectAll = SelectAll;
}
