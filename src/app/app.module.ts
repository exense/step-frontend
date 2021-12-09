import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { AdminModule } from './modules/admin/admin.module';
import { BaseModule } from './modules/base/base.module';
import { AJS_MODULE } from './modules/base/shared/constants';

@NgModule({
  declarations: [],
  imports: [BrowserModule, UpgradeModule, BaseModule, AdminModule],
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [AJS_MODULE]);
  }
}
