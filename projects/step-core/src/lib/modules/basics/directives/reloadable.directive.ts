import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { GlobalReloadService, Reloadable } from '@exense/step-core';
import { Router } from '@angular/router';

@Directive({
  selector: '[stepReloadable]',
  standalone: true,
})
export class ReloadableDirective implements OnInit, OnDestroy, Reloadable {
  private _globalReload = inject(GlobalReloadService);
  private _router = inject(Router);

  ngOnInit(): void {
    this._globalReload.register(this);
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
  }

  reload(): void {
    const url = this._router.url;
    this._router.navigateByUrl('/').then(() => {
      setTimeout(() => this._router.navigateByUrl(url), 500);
    });
  }
}
