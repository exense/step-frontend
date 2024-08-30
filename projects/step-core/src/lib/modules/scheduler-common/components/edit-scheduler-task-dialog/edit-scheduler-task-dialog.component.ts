import { Component, DestroyRef, HostListener, inject, model, OnInit, signal } from '@angular/core';
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
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { KeyValue } from '@angular/common';
import { JSON_FORM_EXPORTS, JsonFieldSchema, JsonFieldUtilsService } from '../../../json-forms';
import { RepositoryParametersSchemasService } from '../../../repository-parameters';
import { LIST_SELECTION_EXPORTS, SelectAll } from '../../../list-selection';

type EditDialogRef = MatDialogRef<EditSchedulerTaskDialogComponent, DialogRouteResult>;

export interface EditSchedulerTaskDialogConfig {
  disablePlan?: boolean;
  disableUser?: boolean;
  hideUser?: boolean;
  plan?: Plan;
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
  ],
})
export class EditSchedulerTaskDialogComponent implements OnInit {
  // readonly rawValueModelOptions: NgModel['options'] = { updateOn: 'blur' };

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

  private task = this._dialogData.task;
  private config = this._dialogData.config;

  protected hideUser = this.config?.hideUser;

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
  protected paramsSchema = signal<JsonFieldSchema | undefined>(undefined);
  protected isLocal = signal(false);
  protected hasExclusions = toSignal(this.hasExclusions$);

  private testCases$ = this.createTestCasesStream();

  protected testCasesWithIds = toSignal(this.testCases$.pipe(map((testCases) => testCases.testCasesWithIds)));

  protected testCasesNamesOnly = toSignal(this.testCases$.pipe(map((testCases) => testCases.testCasesNamesOnly)));

  ngOnInit(): void {
    this.initializeTask();
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    taskForm2Model(this.task, this.taskForm);
    this.error.set('');
    this._api.saveExecutionTask(this.task).subscribe({
      next: (task) => this._matDialogRef.close({ isSuccess: !!task }),
      error: () => {
        this.error.set('Invalid CRON expression or server error.');
      },
    });
  }

  configureCronExpression(): void {
    this._cron.configureExpression().subscribe((expression) => {
      if (expression) {
        this.taskForm.controls.cron.setValue(expression);
      }
    });
  }

  addCronExclusion(): void {
    this.taskForm.controls.cronExclusions.push(taskCronExclusionFormCreate(this._fb));
  }

  removeExclusion(index: number) {
    this.taskForm.controls.cronExclusions.removeAt(index);
  }

  configureCronExpressionForExclusion(exclusionForm: TaskCronExclusionForm): void {
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
        return this._controllerApi.getReport(repositoryRef);
      }),
      map((items) => (!items?.runs?.length ? undefined : items)),
      map((overview) =>
        overview?.runs?.map((item) => {
          const key = item.id;
          const value = item.testplanName;
          return { key, value } as KeyValue<string, string>;
        }),
      ),
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
