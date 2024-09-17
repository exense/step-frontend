import { Component, inject } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';
import { SpecialLinksService } from '../../services/special-links.service';

@Component({
  selector: 'step-my-account-button',
  template: `<step-icon name="settings" /> User Settings`,
  styleUrls: ['./my-account-button.component.scss'],
})
export class MyAccountButtonComponent extends LinkButtonComponent {
  private _specialLinks = inject(SpecialLinksService);

  protected override initUrl(): string {
    return this._specialLinks.userSettings();
  }
}
