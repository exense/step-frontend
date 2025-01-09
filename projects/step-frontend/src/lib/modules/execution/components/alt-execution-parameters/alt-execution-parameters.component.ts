import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AugmentedScreenService } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-alt-execution-parameters',
  templateUrl: './alt-execution-parameters.component.html',
  styleUrl: './alt-execution-parameters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionParametersComponent {
  private _screensService = inject(AugmentedScreenService);

  private executionParametersInfo = toSignal(
    this._screensService.getScreenInputsByScreenIdWithCache('executionParameters'),
    { initialValue: [] },
  );
  private executionParametersNames = computed(() =>
    this.executionParametersInfo().reduce(
      (res, item) => {
        res[item.input!.id!] = item.input!.label!;
        return res;
      },
      {} as Record<string, string>,
    ),
  );

  /** @Input() **/
  readonly executionParameters = input<Record<string, string> | undefined>(undefined);

  protected readonly parametersList = computed(() => {
    const parameters = this.executionParameters() ?? {};
    const names = this.executionParametersNames();

    let result: KeyValue<string, string>[] = [];
    result = Object.entries(parameters).reduce((res, [id, value]) => {
      const key = names[id] ?? id;
      return res.concat({ key, value });
    }, result);
    return result;
  });
}
