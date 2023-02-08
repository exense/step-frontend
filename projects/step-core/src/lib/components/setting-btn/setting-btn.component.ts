import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { ILocationService } from 'angular';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { AJS_LOCATION } from '../../shared';
import { AuthService } from '../../step-core.module';

@Component({
  selector: 'step-setting-btn',
  template: `<step-icon name="settings"></step-icon>`,
  styleUrls: [],
})
export class SettingBtnComponent implements CustomComponent, OnInit {
  context?: any;

  protected url: string = '/root/settings';

  constructor(private _authService: AuthService, @Inject(AJS_LOCATION) private _ajsLocation: ILocationService) {}

  ngOnInit(): void {
    this.initUrl();
  }

  @HostListener('click')
  openSettings(): void {
    if (this._ajsLocation.path().includes(this.url)) {
      this._ajsLocation.path('/');
      setTimeout(() => this._ajsLocation.path(this.url));
    } else {
      this._ajsLocation.path(this.url);
    }
  }

  private initUrl(): void {
    const hasAdminPermissions = this._authService.hasRight('admin-ui-menu');

    if (hasAdminPermissions) {
      this.url = '/root/admin';
    } else {
      this.url = '/root/settings';
    }
  }
}
