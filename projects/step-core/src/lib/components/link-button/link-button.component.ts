import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Component({
  template: '',
  standalone: false,
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

    // force refresh by navigating away and back, added timeout to solve race-condition
    from(this._router.navigateByUrl('/')).subscribe(() =>
      setTimeout(() => this._router.navigateByUrl(this.url!, { replaceUrl: true }), 0),
    );
  }
}
