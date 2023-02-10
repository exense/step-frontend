import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { ILocationService } from 'angular';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { AJS_LOCATION } from '../../shared';
import { AuthService } from '../../step-core.module';

@Component({
  selector: 'step-settings-button',
  template: `<step-icon name="settings"></step-icon>`,
  styleUrls: [],
})
export class SettingButtonComponent implements CustomComponent, OnInit {
  context?: any;

  protected url: string = '/root/settings';

  constructor(protected _authService: AuthService, @Inject(AJS_LOCATION) private _ajsLocation: ILocationService) {}

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

  protected initUrl(): void {
    this.url = '/root/settings';
  }
}
