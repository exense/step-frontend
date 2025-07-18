import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { Reloadable } from '../../basics/types/reloadable';
import { GlobalReloadService } from '../../basics/injectables/global-reload.service';
import { NavigatorService } from '../injectables/navigator.service';

@Directive({
  selector: '[stepReloadable]',
  standalone: true,
})
export class ReloadableDirective implements OnInit, OnDestroy, Reloadable {
  private _globalReload = inject(GlobalReloadService);
  private _navigator = inject(NavigatorService);

  ngOnInit(): void {
    this._globalReload.register(this);
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
  }

  reload(): void {
    this._navigator.reloadCurrentRoute();
  }
}
