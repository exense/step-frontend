import { inject, Injectable } from '@angular/core';
import { BookmarkNavigationStrategy } from '../types/bookmark-navigation-strategy';
import { DefaultBookmarkNavigationStrategyService } from './default-bookmark-navigation-strategy.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkNavigatorService implements BookmarkNavigationStrategy {
  private _defaultStrategy = inject(DefaultBookmarkNavigationStrategyService);

  private currentStrategy: BookmarkNavigationStrategy = this._defaultStrategy;

  navigateBookmark(link: string, isOpenInSeparateTab?: boolean): void {
    this.currentStrategy.navigateBookmark(link, isOpenInSeparateTab);
  }

  useStrategy(strategy: BookmarkNavigationStrategy): void {
    this.currentStrategy = strategy;
  }
}
