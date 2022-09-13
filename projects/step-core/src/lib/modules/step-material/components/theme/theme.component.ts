import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { STEP_CORE_JS } from '../../../../angularjs/module';
import { ThemeRegisterService } from '../../services/theme-register.service';

@Component({
  selector: 'step-theme',
  template: '',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeComponent implements AfterViewInit {
  constructor(
    private _view: ViewContainerRef,
    private _injector: Injector,
    private _themeRegister: ThemeRegisterService,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngAfterViewInit(): void {
    const definitions = this._themeRegister.definitions;
    const def = definitions[definitions.length - 1];

    if (!def) {
      return;
    }

    this._view.createComponent(def.componentFactory, undefined, this._injector);
    const body = this._document.body;
    if (!body.classList.contains(def.globalStyleClass)) {
      body.classList.add(def.globalStyleClass);
    }
  }
}

getAngularJSGlobal()
  .module(STEP_CORE_JS)
  .directive('stepTheme', downgradeComponent({ component: ThemeComponent }));
