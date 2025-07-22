import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeRegisterService } from '../../services/theme-register.service';

@Component({
  selector: 'step-theme',
  template: '',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ThemeComponent implements AfterViewInit {
  private _view = inject(ViewContainerRef);
  private _injector = inject(Injector);
  private _themeRegister = inject(ThemeRegisterService);
  private _document = inject(DOCUMENT);

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
