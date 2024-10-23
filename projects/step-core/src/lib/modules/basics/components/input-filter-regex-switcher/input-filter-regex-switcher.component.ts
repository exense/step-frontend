import { Component, inject } from '@angular/core';
import { FilterRegexSwitcherService } from '../../injectables/filter-regex-switcher.service';

@Component({
  selector: 'step-input-filter-regex-switcher',
  templateUrl: './input-filter-regex-switcher.component.html',
  styleUrl: './input-filter-regex-switcher.component.scss',
})
export class InputFilterRegexSwitcherComponent {
  protected readonly _regexSwitcher = inject(FilterRegexSwitcherService, { optional: true });
}
