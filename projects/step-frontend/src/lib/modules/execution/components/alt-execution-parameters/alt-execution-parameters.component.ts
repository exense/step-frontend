import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  AugmentedScreenService,
  MultipleProjectsService,
  ScreenInput,
  STORE_ALL,
  TableMemoryStorageService,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableStorageService,
} from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-alt-execution-parameters',
  templateUrl: './alt-execution-parameters.component.html',
  styleUrl: './alt-execution-parameters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('executionParametersList', STORE_ALL),
  ],
})
export class AltExecutionParametersComponent {
  private _screensService = inject(AugmentedScreenService);
  private _multipleProjects = inject(MultipleProjectsService);

  private executionParametersInfo = toSignal(
    this._screensService.getScreenInputsByScreenIdWithCache('executionParameters'),
    { initialValue: [] },
  );

  readonly executionParameters = input<Record<string, string> | undefined>(undefined);
  readonly executionProjectId = input<string | undefined>(undefined);

  protected readonly parametersList = computed(() => {
    const parameters = this.executionParameters() ?? {};
    const parametersInfo = this.getVisibleExecutionParametersInfo();

    const resolvedParameterIds = new Set<string>();
    const result = parametersInfo.reduce(
      (res, screenInput) => {
        const id = screenInput.input?.id;
        if (!id || !parameters.hasOwnProperty(id)) {
          return res;
        }
        const label = screenInput.input?.label;
        const key = label ?? id;
        const value = parameters[id];
        resolvedParameterIds.add(id);
        return res.concat({ key, value });
      },
      [] as KeyValue<string, string>[],
    );

    Object.entries(parameters)
      .filter(([id]) => !resolvedParameterIds.has(id))
      .forEach(([key, value]) => result.push({ key, value }));

    return result;
  });

  private getVisibleExecutionParametersInfo(): ScreenInput[] {
    const parametersInfo = this.executionParametersInfo();
    const executionProjectId = this.executionProjectId();
    const projects = this._multipleProjects.getProjects();
    const currentProjectId = this._multipleProjects.currentProject()?.projectId;

    if (!executionProjectId || currentProjectId === executionProjectId || !projects.length) {
      return this.deduplicateByInputId(parametersInfo, executionProjectId);
    }

    const globalProjectIds = new Set(
      projects.filter((project) => project.global && !!project.projectId).map((project) => project.projectId!),
    );

    const visibleProjectIds = new Set([executionProjectId, ...globalProjectIds]);
    const visibleParametersInfo = parametersInfo.filter((screenInput) => {
      const screenInputProjectId = screenInput.attributes?.['project'];
      return !screenInputProjectId || visibleProjectIds.has(screenInputProjectId);
    });

    return this.deduplicateByInputId(visibleParametersInfo, executionProjectId);
  }

  private deduplicateByInputId(screenInputs: ScreenInput[], executionProjectId?: string): ScreenInput[] {
    const result = new Map<string, ScreenInput>();
    for (const screenInput of screenInputs) {
      const id = screenInput.input?.id;
      if (!id) {
        continue;
      }

      const existing = result.get(id);
      const isExecutionProjectInput = screenInput.attributes?.['project'] === executionProjectId;
      const existingIsExecutionProjectInput = existing?.attributes?.['project'] === executionProjectId;
      if (!existing || (isExecutionProjectInput && !existingIsExecutionProjectInput)) {
        result.set(id, screenInput);
      }
    }
    return Array.from(result.values());
  }
}
