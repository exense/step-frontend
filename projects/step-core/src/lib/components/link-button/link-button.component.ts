import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AJS_LOCATION } from '../../shared';

@Component({
  template: '',
})
export abstract class LinkButtonComponent implements OnInit {
  private _$location = inject(AJS_LOCATION);

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
    if (this._$location.path().includes(this.url)) {
      this._$location.path('/');
      setTimeout(() => this._$location.path(this.url!));
    } else {
      this._$location.path(this.url);
    }
  }
}
