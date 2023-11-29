import { Component, inject, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent implements OnInit {
  private _viewRegistry = inject(ViewRegistryService);

  ngOnInit(): void {
    this._viewRegistry.initialNavigation();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepMainView', downgradeComponent({ component: MainViewComponent }));
