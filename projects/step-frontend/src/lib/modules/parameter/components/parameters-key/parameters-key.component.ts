import { Component, computed, inject, input, signal } from '@angular/core';
import { CustomColumnOptions, CustomComponent, Parameter } from '@exense/step-core';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-parameters-key',
  templateUrl: './parameters-key.component.html',
  styleUrls: ['./parameters-key.component.scss'],
})
export class ParametersKeyComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private readonly options$ = this._customColumnOptions?.options$ ?? of([] as string[]);

  private readonly options = toSignal(this.options$, {
    initialValue: [],
  });

  readonly parameterInput = input<Parameter | undefined>(undefined, { alias: 'parameter' });
  readonly noLinkInput = input<boolean | undefined>(undefined, { alias: 'noLink' });
  readonly noDescriptionHintInput = input<boolean | undefined>(undefined, { alias: 'noDescriptionHint' });

  private contextInternal = signal<Parameter | undefined>(undefined);

  protected readonly parameter = computed(() => {
    const context = this.contextInternal();
    const parameter = this.parameterInput();
    return context ?? parameter;
  });

  protected readonly noLink = computed(() => {
    const options = this.options();
    const noLink = this.noLinkInput();
    return noLink ?? options.includes('noEditorLink');
  });

  protected readonly noDescriptionHint = computed(() => {
    const options = this.options();
    const noDescriptionHint = this.noDescriptionHintInput();
    return noDescriptionHint ?? options.includes('noDescriptionHint');
  });

  context?: Parameter;

  contextChange(previousContext?: Parameter, currentContext?: Parameter): void {
    this.contextInternal.set(currentContext);
  }
}
