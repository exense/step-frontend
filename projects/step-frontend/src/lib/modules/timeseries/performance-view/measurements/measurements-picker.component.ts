import { Component, Input, OnInit } from '@angular/core';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../../execution-page/time-series-keywords.context';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-measurements-picker',
  templateUrl: './measurements-picker.component.html',
  styleUrls: ['./measurements-picker.component.scss'],
})
export class MeasurementsPickerComponent implements OnInit {
  @Input() contextId!: string;

  private keywordsService!: TimeSeriesKeywordsContext;
  keywords: { [key: string]: KeywordSelection } = {};
  keywordSearchValue: string = '';
  allSeriesChecked: boolean = true;
  activeKeywords = 0;

  constructor(private executionPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.contextId) {
      throw new Error('Context Id input must be present');
    }
    this.keywordsService = this.executionPageService.getContext(this.contextId).getKeywordsContext();
    this.keywordsService.onKeywordsUpdated().subscribe((keywords) => {
      this.keywords = keywords;
      this.activeKeywords = 0;
      Object.keys(keywords).forEach((key) => {
        if (keywords[key].isVisible && keywords[key].isSelected) {
          this.activeKeywords++;
        }
      });
    });
    this.keywordsService.onKeywordToggled().subscribe((selection) => {
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
    if (event.target.checked) {
      this.activeKeywords++;
    } else {
      this.activeKeywords--;
    }
  }

  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.key.localeCompare(b.key);
  };
}
