import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, viewChild } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'step-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrl: './input-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'InputDropdown',
})
export class InputDropdownComponent {
  // eslint-disable-next-line step-lint/component-public-fields -- read by InputDropdownTriggerDirective
  readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');

  // eslint-disable-next-line step-lint/component-public-fields -- read by InputDropdownTriggerDirective
  readonly panelId = `step-input-dropdown-${nextId++}`;
}
