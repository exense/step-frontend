import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';

/**
 * Every execution will have a list of custom keywords depending on the actual measurements that were found.
 * This class stores all the keywords with their attributes like assigned colors, if they are selected in the view or not, etc
 */
export class TimeSeriesKeywordsContext {
  private keywords: { [key: string]: KeywordSelection } = {};
  private allKeywordsSelected = true;

  private keywordsChangeSubject = new BehaviorSubject<{ [key: string]: KeywordSelection }>({});
  private keywordToggleSubject = new Subject<KeywordSelection>();
  private selectAllSubject = new BehaviorSubject<boolean>(true);

  constructor(public readonly colorsPool: TimeseriesColorsPool) {}

  getColor(keyword: string): string {
    return this.colorsPool.getColor(keyword);
  }

  getStatusColor(status: string): string {
    return this.colorsPool.getStatusColor(status);
  }

  getKeywordSelection(keyword: string): KeywordSelection {
    return this.keywords[keyword];
  }

  /**
   * Just the specified keywords will be visible, but the other's selections will be saved
   */
  setKeywords(keywords: string[], selectAll = false): void {
    Object.keys(this.keywords).forEach((keyword) => {
      this.keywords[keyword].isVisible = false;
    });
    keywords.forEach((keyword) => {
      if (!this.keywords[keyword]) {
        // it is a new item
        this.keywords[keyword] = {
          id: keyword,
          isVisible: true,
          isSelected: this.allKeywordsSelected || selectAll,
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

  private emitAllSelectionChange(): void {
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
  id: string; // unique id, usually the keyword name
  /**
   * If a zoom is applied, there may be keywords that are not present anymore in the buckets. we don't want to remove them, but hide them. when the zoom.
   * Eventually when the zoom is reset eventually, the 'present' keywords will be shown again, with their previous selection.
   */
  isVisible: boolean;
  isSelected: boolean; // if it's checked or not in the view.
  color: string; // it's assigned color
}
