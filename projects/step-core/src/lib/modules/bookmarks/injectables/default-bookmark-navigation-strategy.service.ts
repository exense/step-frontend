import { inject, Injectable } from '@angular/core';
import { BookmarkNavigationStrategy } from '../types/bookmark-navigation-strategy';
import { Router } from '@angular/router';
import { NavigatorService } from '../../routing';

@Injectable({
  providedIn: 'root',
})
export class DefaultBookmarkNavigationStrategyService implements BookmarkNavigationStrategy {
  protected _router = inject(Router);
  protected _navigator = inject(NavigatorService);

  navigateBookmark(link: string, isOpenInSeparateTab?: boolean): void {
    if (isOpenInSeparateTab) {
      this._navigator.navigate(link, true);
      return;
    }
    this._router.navigateByUrl(link);
  }
}
