import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, timer } from 'rxjs';

@Component({
  template: '',
})
export abstract class LinkButtonComponent implements OnInit {
  private _router = inject(Router);

  private url?: string;

  protected abstract initUrl(): string;

  ngOnInit(): void {
    this.url = this.initUrl();
  }

  @HostListener('click')
  private handleClick(): void {
    if (!this.url) {
      return;
    }
    if (!this._router.url.includes(this.url)) {
      this._router.navigateByUrl(this.url);
      return;
    }

    from(this._router.navigateByUrl('/'))
      .pipe(switchMap(() => timer(100)))
      .subscribe(() => this._router.navigateByUrl(this.url!, { replaceUrl: true }));
  }
}
