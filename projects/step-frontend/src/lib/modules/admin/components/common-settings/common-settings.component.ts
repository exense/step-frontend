import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SpecialLinksService } from '@exense/step-core';

@Component({
  selector: 'step-common-settings',
  templateUrl: './common-settings.component.html',
  styleUrl: './common-settings.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CommonSettingsComponent {
  private _specialLinks = inject(SpecialLinksService);
  readonly userSettings = this._specialLinks.userSettings();
  readonly adminSettings = this._specialLinks.adminSettings();
}
