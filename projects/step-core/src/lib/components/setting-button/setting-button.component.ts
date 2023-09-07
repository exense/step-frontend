import { Component, inject } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';
import { SpecialLinksService } from '../../services/special-links.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../shared';

@Component({
  selector: 'step-settings-button',
  template: `<step-icon name="settings"></step-icon>`,
  styleUrls: [],
})
export class SettingButtonComponent extends LinkButtonComponent {
  private _specialLinks = inject(SpecialLinksService);

  protected override initUrl(): string {
    return this._specialLinks.settings();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSettingsButton', downgradeComponent({ component: SettingButtonComponent }));
