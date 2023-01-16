import { Component, HostListener, Inject } from '@angular/core';
import { ILocationService } from 'angular';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { AJS_LOCATION } from '../../shared';

@Component({
  selector: 'step-setting-btn',
  template: `<step-icon name="settings"></step-icon>`,
  styleUrls: [],
})
export class SettingBtnComponent implements CustomComponent {
  context?: any;

  protected url: string = '/root/settings';

  constructor(@Inject(AJS_LOCATION) private _ajsLocation: ILocationService) {}

  @HostListener('click')
  openSettings(): void {
    if (this._ajsLocation.path().includes(this.url)) {
      this._ajsLocation.path('/');
      setTimeout(() => this._ajsLocation.path(this.url));
    } else {
      this._ajsLocation.path(this.url);
    }
  }
}
