import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { ArtefactInlineItem } from '@exense/step-core';

@Component({
  selector: 'step-artefact-inline-field',
  templateUrl: './artefact-inline-field.component.html',
  styleUrl: './artefact-inline-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtefactInlineFieldComponent {
  readonly item = input.required<ArtefactInlineItem>();

  protected readonly itemValue = computed(() => {
    const item = this.item();
    if (!item.isResolved) {
      return '[unresolved]';
    }
    if (!item.value) {
      return item.value as undefined;
    }
    if (item.value.dynamic) {
      return item.value.expression;
    }
    let value = item.value.value;
    if (!value) {
      return value;
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value;
  });

  protected readonly itemValueTooltip = computed(() => this.itemValue()?.toString() ?? '');

  protected readonly tooltipMessage = computed(() => {
    const label = this.item().label;
    const value = (this.itemValue() ?? '').toString();
    if (label && value) {
      return `${label}:\n ${value}`;
    }
    return label ?? value;
  });
}
