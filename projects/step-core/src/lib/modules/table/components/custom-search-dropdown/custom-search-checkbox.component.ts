import { Component } from '@angular/core';
import { CustomSearchDropdownComponent } from './custom-search-dropdown.component';

@Component({
  selector: 'step-custom-search-checkbox',
  templateUrl: './custom-search-dropdown.component.html',
  styleUrls: ['./custom-search-dropdown.component.scss'],
})
export class CustomSearchCheckboxComponent extends CustomSearchDropdownComponent {
  protected override options = [true.toString(), false.toString()];

  protected override updateOptions() {
    // Not required, as options are always the same
  }
}
