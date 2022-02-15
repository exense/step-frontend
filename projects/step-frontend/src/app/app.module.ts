import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { AdminModule } from './modules/admin/admin.module';
import { PLUGINS_INITIALIZER } from './plugins-initializer/plugins-initializer';
import { StepCoreModule, AJS_MODULE } from '@exense/step-core';

@NgModule({
  declarations: [],
  imports: [BrowserModule, UpgradeModule, StepCoreModule, AdminModule],
  providers: [PLUGINS_INITIALIZER],
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [AJS_MODULE]);
  }
}
