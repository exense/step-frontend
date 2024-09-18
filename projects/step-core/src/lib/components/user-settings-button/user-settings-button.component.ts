import { Component, inject } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';
import { SpecialLinksService } from '../../services/special-links.service';

@Component({
  selector: 'step-user-settings-button',
  template: `<step-icon name="settings" /> User Settings`,
  styleUrls: ['./user-settings-button.component.scss'],
})
export class UserSettingsButtonComponent extends LinkButtonComponent {
  private _specialLinks = inject(SpecialLinksService);

  protected override initUrl(): string {
    return this._specialLinks.userSettings();
  }
}
