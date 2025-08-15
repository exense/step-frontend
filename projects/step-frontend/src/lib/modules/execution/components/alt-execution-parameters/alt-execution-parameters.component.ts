import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  AugmentedScreenService,
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

  private executionParametersInfo = toSignal(
    this._screensService.getScreenInputsByScreenIdWithCache('executionParameters'),
    { initialValue: [] },
  );

  readonly executionParameters = input<Record<string, string> | undefined>(undefined);

  protected readonly parametersList = computed(() => {
    const parameters = this.executionParameters() ?? {};
    const parametersInfo = this.executionParametersInfo();

    const result = parametersInfo
      .reduce(
        (res, screenInput) => {
          const id = screenInput.input!.id!;
          const label = screenInput.input!.label!;
          if (!parameters.hasOwnProperty(id)) {
            return res.concat(undefined);
          }
          const key = label ?? id;
          const value = parameters[id];
          return res.concat({ key, value });
        },
        [] as (KeyValue<string, string> | undefined)[],
      )
      .filter((item) => !!item) as KeyValue<string, string>[];

    return result;
  });
}
