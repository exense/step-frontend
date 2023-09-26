import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../../pages/execution-page/time-series-keywords.context';
import { KeyValue } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'step-measurements-picker',
  templateUrl: './measurements-picker.component.html',
  styleUrls: ['./measurements-picker.component.scss'],
})
export class MeasurementsPickerComponent implements OnInit, OnDestroy {
  @Input() contextId!: string;

  private keywordsService!: TimeSeriesKeywordsContext;
  keywords: { [key: string]: KeywordSelection } = {};
  keywordSearchValue: string = '';
  allSeriesChecked: boolean = true;
  activeKeywords = 0;

  terminator$ = new Subject<void>();

  private contextsFactory = inject(TimeSeriesContextsFactory);

  ngOnInit(): void {
    if (!this.contextId) {
      throw new Error('Context Id input must be present');
    }
    this.keywordsService = this.contextsFactory.getContext(this.contextId).keywordsContext;
    this.keywordsService
      .onKeywordsUpdated()
      .pipe(takeUntil(this.terminator$))
      .subscribe((keywords) => {
        this.keywords = keywords;
        this.activeKeywords = 0;
        let visibleKeywords = 0;
        Object.keys(keywords).forEach((key) => {
          let keyword = keywords[key];
          if (keyword.isVisible) {
            visibleKeywords++;
            if (keyword.isSelected) {
              this.activeKeywords++;
            }
          }
        });
        if (visibleKeywords === this.activeKeywords) {
          this.allSeriesChecked = true;
        }
        this.keywords = { ...this.keywords };
      });
    this.keywordsService
      .onAllSelectionChanged()
      .pipe(takeUntil(this.terminator$))
      .subscribe((allSelected) => {
        this.allSeriesChecked = allSelected;
      });
    this.keywordsService
      .onKeywordToggled()
      .pipe(takeUntil(this.terminator$))
      .subscribe((selection) => {
        let isSelected = this.keywords[selection.id].isSelected;
        if (isSelected) {
          this.activeKeywords++;
        } else {
          this.allSeriesChecked = false;
          this.activeKeywords--;
        }
      });
  }

  onAllSeriesCheckboxClick(event: any) {
    this.keywordsService.toggleSelectAll();
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
