import { Component, inject } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';
import { SpecialLinksService } from '../../services/special-links.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../shared';

@Component({
  selector: 'step-my-account-button',
  template: `<step-icon name="settings"></step-icon> My account`,
  styleUrls: ['./my-account-button.component.scss'],
})
export class MyAccountButtonComponent extends LinkButtonComponent {
  private _specialLinks = inject(SpecialLinksService);

  protected override initUrl(): string {
    return this._specialLinks.myAccount();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepMyAccountButton', downgradeComponent({ component: MyAccountButtonComponent }));
