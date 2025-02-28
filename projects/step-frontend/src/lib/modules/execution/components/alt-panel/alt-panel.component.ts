import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { Execution, ExecutionCustomPanelItemInfo } from '@exense/step-core';

@Component({
  selector: 'step-alt-panel',
  templateUrl: './alt-panel.component.html',
  styleUrl: './alt-panel.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'className()',
    '[style.--colSpan]': 'colSpan()',
  },
})
export class AltPanelComponent {
  /** @Input() **/
  readonly info = input.required<ExecutionCustomPanelItemInfo>();

  /** @Input() **/
  readonly execution = input.required<Execution>();

  protected readonly title = computed(() => this.info().label);
  protected readonly type = computed(() => this.info().type);

  private metadata = computed(() => this.info().metadata);
  protected readonly className = computed(() => {
    const customClass = this.metadata()?.cssClassName;
    return ['widget', customClass].filter((item) => !!item).join(' ');
  });
  protected readonly colSpan = computed(() => this.metadata()?.colSpan ?? 1);
}
