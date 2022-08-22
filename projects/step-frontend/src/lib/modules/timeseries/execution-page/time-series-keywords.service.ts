import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';

export class TimeSeriesKeywordsService {
  private keywords: { [key: string]: KeywordSelection } = {};
  private allKeywordsSelected = true;

  private keywordsChangeSubject = new BehaviorSubject<{ [key: string]: KeywordSelection }>({});
  private keywordToggleSubject = new Subject<KeywordSelection>();
  private selectAllSubject = new BehaviorSubject<boolean>(true);

  private colorsPool: TimeseriesColorsPool;

  constructor(colorsPool: TimeseriesColorsPool) {
    this.colorsPool = colorsPool;
  }

  getColor(keyword: string) {
    return this.colorsPool.getColor(keyword);
  }

  getKeywordSelection(keyword: string): KeywordSelection {
    return this.keywords[keyword];
  }

  /**
   * Just the specified keywords will be visible, but the other's selections will be saved
   */
  setKeywords(keywords: string[]): void {
    Object.keys(this.keywords).forEach((keyword) => {
      this.keywords[keyword].isVisible = false;
    });
    keywords.forEach((keyword) => {
      if (!this.keywords[keyword]) {
        // it is a new item
        this.keywords[keyword] = {
          id: keyword,
          isVisible: true,
          isSelected: this.allKeywordsSelected,
          color: this.colorsPool.getColor(keyword),
        };
      } else {
        this.keywords[keyword].isVisible = true;
      }
    });
    this.keywordsChangeSubject.next(this.keywords);
  }

  toggleSelectAll(): void {
    this.allKeywordsSelected = !this.allKeywordsSelected;
    Object.keys(this.keywords).forEach((keyword) => {
      let selection = this.keywords[keyword];
      if (selection.isSelected !== this.allKeywordsSelected) {
        selection.isSelected = this.allKeywordsSelected;
        this.keywordToggleSubject.next(selection);
      }
    });

    this.emitAllSelectionChange();
  }

  toggleKeyword(keyword: string): void {
    let currentSelection = this.keywords[keyword];
    currentSelection.isSelected = !currentSelection.isSelected;
    if (!currentSelection.isSelected) {
      this.allKeywordsSelected = false;
      this.emitAllSelectionChange();
    }
    this.keywordToggleSubject.next(currentSelection);
  }

  private emitAllSelectionChange() {
    this.selectAllSubject.next(this.allKeywordsSelected);
  }

  public onKeywordsUpdated(): Observable<{ [key: string]: KeywordSelection }> {
    return this.keywordsChangeSubject.asObservable();
  }

  public onAllSelectionChanged(): Observable<boolean> {
    return this.selectAllSubject.asObservable();
  }

  public onKeywordToggled(): Observable<KeywordSelection> {
    return this.keywordToggleSubject.asObservable();
  }
}

export interface KeywordSelection {
  id: string;
  isVisible: boolean;
  isSelected: boolean;
  color: string;
}
