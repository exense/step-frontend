import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Reloadable } from '../types/reloadable';
import { GlobalReloadService } from '../injectables/global-reload.service';
import { first, map } from 'rxjs';

@Directive({
  selector: '[stepReloadable]',
  standalone: true,
})
export class ReloadableDirective implements OnInit, OnDestroy, Reloadable {
  private _globalReload = inject(GlobalReloadService);
  private _router = inject(Router);
  private _location = inject(Location);

  private navigationEnd$ = this._router.events.pipe(map((event) => event instanceof NavigationEnd));

  ngOnInit(): void {
    this._globalReload.register(this);
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
  }

  reload(): void {
    if (this._router.getCurrentNavigation()) {
      this.navigationEnd$.pipe(first()).subscribe(() => this.reload());
      return;
    }

    const url = this._location.path(true);
    this._router.navigateByUrl('/').then(() => {
      setTimeout(() => this._router.navigateByUrl(url), 500);
    });
  }
}
