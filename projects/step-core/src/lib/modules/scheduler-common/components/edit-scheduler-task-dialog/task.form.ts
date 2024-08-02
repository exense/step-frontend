import { FormBuilder, Validators } from '@angular/forms';
import { ArtefactFilter, CronExclusion, ExecutiontTaskParameters, Plan } from '../../../../client/step-client-module';
import { cronValidator } from '../../../cron/types/cron-validator';
import { v4 } from 'uuid';

export const EXCLUSION_ID = Symbol('exclusionId');
export type TaskForm = ReturnType<typeof taskFormCreate>;
export type TaskCronExclusionForm = ReturnType<typeof taskCronExclusionFormCreate>;

enum ArtefactFilterType {
  TEST_CASES_ID = 'step.artefacts.filters.TestCaseIdFilter',
  TEST_CASES = 'step.artefacts.filters.TestCaseFilter',
}

export const taskFormCreate = (fb: FormBuilder) => {
  const form = fb.group({
    name: fb.control('', [Validators.required]),
    repositoryId: fb.control(''),
    repositoryParameters: fb.control<Record<string, string>>({}),
    plan: fb.control<Partial<Plan> | null>(null),
    cron: fb.control<string>('', [Validators.required, cronValidator]),
    description: fb.control<string>(''),
    cronExclusions: fb.array<TaskCronExclusionForm>([]),
    customExecutionsParameters: fb.control<Record<string, string>>({}),
    userID: fb.control<string>(''),
    includedRepositoryIds: fb.control<string[]>([]),
    includedRepositoryNames: fb.control<string[]>([]),
    assertionPlan: fb.control<string>(''),
    active: fb.control<boolean>(false),
  });

  form.controls.repositoryId.disable();

  return form;
};

export const taskCronExclusionFormCreate = (fb: FormBuilder, initialValue?: CronExclusion) => {
  const form = fb.group({
    cron: fb.control(initialValue?.cronExpression ?? '', [Validators.required, cronValidator]),
    description: fb.control(initialValue?.description ?? ''),
  });
  (form as any)[EXCLUSION_ID] = v4();
  return form;
};

export const taskModel2Form = (task: ExecutiontTaskParameters, form: TaskForm, fb: FormBuilder) => {
  const name = task.attributes?.['name'] ?? '';
  const repositoryObject = task?.executionsParameters?.repositoryObject;
  const repositoryId = repositoryObject?.repositoryID ?? 'local';
  const repositoryParameters = repositoryObject?.repositoryParameters ?? {};
  const assertionPlan = task.assertionPlan ?? '';

  let plan: Partial<Plan> | null = null;

  const isLocal = repositoryId === 'local';
  if (isLocal) {
    const id = repositoryParameters?.['planid'];
    const name = task.executionsParameters?.description ?? '';
    if (id) {
      plan = { id, attributes: { name } };
    }
    delete repositoryParameters?.['planid'];
  }
  const cron = task.cronExpression ?? '';
  const description = task.attributes?.['description'] ?? '';
  const customExecutionsParameters = task?.executionsParameters?.customParameters ?? {};
  const userID = task?.executionsParameters?.userID ?? '';

  form.controls.plan.setValidators(isLocal ? [Validators.required] : null);

  let includedRepositoryIds: string[] = [];
  let includedRepositoryNames: string[] = [];
  const artefactsFilter = task.executionsParameters?.artefactFilter;
  if (artefactsFilter) {
    switch (artefactsFilter.class) {
      case ArtefactFilterType.TEST_CASES_ID:
        includedRepositoryIds = (artefactsFilter as any).includedIds as string[];
        break;
      case ArtefactFilterType.TEST_CASES:
        includedRepositoryNames = (artefactsFilter as any).includedNames as string[];
        break;
      default:
        break;
    }
  }

  form.setValue({
    name,
    repositoryId,
    repositoryParameters,
    plan,
    cron,
    description,
    customExecutionsParameters,
    userID,
    includedRepositoryIds,
    includedRepositoryNames,
    cronExclusions: [],
    assertionPlan,
    active: !!task.active,
  });
  (task.cronExclusions ?? []).forEach((exclusion) => {
    form.controls.cronExclusions.push(taskCronExclusionFormCreate(fb, exclusion));
  });
};

export const taskForm2Model = (task: ExecutiontTaskParameters, form: TaskForm) => {
  const {
    name,
    plan,
    cron,
    description,
    customExecutionsParameters,
    userID,
    cronExclusions,
    repositoryParameters,
    assertionPlan,
    active,
  } = form.value!;
  const repositoryId = form.controls.repositoryId.value;

  task.attributes = task.attributes ?? {};
  task.attributes['name'] = name ?? '';
  task.attributes['description'] = description ?? '';
  task.assertionPlan = assertionPlan || undefined;

  task.executionsParameters = task.executionsParameters ?? {};

  if (repositoryId === 'local' && plan) {
    const repositoryObject = (task.executionsParameters.repositoryObject =
      task.executionsParameters.repositoryObject ?? {});
    repositoryObject.repositoryID = repositoryObject.repositoryID ?? repositoryId;
    repositoryObject.repositoryParameters = repositoryParameters ?? {};
    repositoryObject.repositoryParameters!['planid'] = plan.id ?? '';
    task.executionsParameters!.description = plan?.attributes?.['name'] ?? undefined;
  }

  const includedIds = form.controls.includedRepositoryIds.value;
  if (includedIds?.length) {
    task.executionsParameters.artefactFilter = {
      class: ArtefactFilterType.TEST_CASES_ID,
      includedIds,
    } as ArtefactFilter;
  }

  const includedNames = form.controls.includedRepositoryNames.value;
  if (includedNames?.length) {
    task.executionsParameters.artefactFilter = {
      class: ArtefactFilterType.TEST_CASES,
      includedNames,
    } as ArtefactFilter;
  }

  task.cronExpression = cron!;
  task.executionsParameters.customParameters = customExecutionsParameters ?? {};
  task.executionsParameters.userID = userID ?? undefined;
  task.cronExclusions = (cronExclusions ?? []).map(({ cron, description }) => ({
    cronExpression: cron ?? '',
    description: description ?? '',
  }));
  task.active = !!active;
};
