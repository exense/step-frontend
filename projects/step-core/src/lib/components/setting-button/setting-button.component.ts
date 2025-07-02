import { Component, inject } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';
import { SpecialLinksService } from '../../services/special-links.service';

@Component({
  selector: 'step-settings-button',
  template: `<step-icon name="settings"></step-icon>`,
  styleUrls: [],
  standalone: false,
})
export class SettingButtonComponent extends LinkButtonComponent {
  private _specialLinks = inject(SpecialLinksService);

  protected override initUrl(): string {
    return this._specialLinks.settings();
  }
}
