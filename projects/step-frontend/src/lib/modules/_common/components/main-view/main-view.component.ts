import { Component, inject, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { Router } from '@angular/router';
import { AJS_MODULE } from '@exense/step-core';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent implements OnInit {
  private _router = inject(Router);

  ngOnInit(): void {
    this._router.initialNavigation();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepMainView', downgradeComponent({ component: MainViewComponent }));
