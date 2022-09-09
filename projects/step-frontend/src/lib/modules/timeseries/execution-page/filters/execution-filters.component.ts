import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExecutionsPageService } from '../../executions-page.service';
import { ExecutionTabContext } from '../execution-tab-context';
import { BucketFilters } from '../../model/bucket-filters';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../time-series-keywords.context';
import { KeywordsService } from '@exense/step-core';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-execution-filters',
  templateUrl: './execution-filters.component.html',
  styleUrls: ['./execution-filters.component.scss'],
})
export class ExecutionFiltersComponent implements OnInit {
  attributesPair: { key?: string; value?: string }[] = [{}, {}, {}, {}];

  filterItems: FilterItem[] = [
    { label: 'Type', attributeName: 'type', options: ['keyword', 'custom'] },
    { label: 'Status', attributeName: 'rnStatus', options: ['FAILED', 'PASSED'] },
  ];

  groupingOptions = [
    { label: 'Name', attributes: ['name'] },
    { label: 'Name & Status', attributes: ['name', 'rnStatus'] },
  ];
  groupingAttributes = this.groupingOptions[0].attributes;

  keywordSearchValue: string = '';
  allSeriesChecked: boolean = true;

  @Input() executionId!: string;

  private executionContext!: ExecutionTabContext;
  private keywordsService!: TimeSeriesKeywordsContext;
  keywords: { [key: string]: KeywordSelection } = {};

  activeKeywords = 0;

  constructor(private executionPageService: ExecutionsPageService) {}

  ngOnInit(): void {
    this.executionContext = this.executionPageService.getContext(this.executionId);
    this.keywordsService = this.executionContext.getKeywordsContext();
    this.keywordsService.onKeywordsUpdated().subscribe((keywords) => {
      this.keywords = keywords;
      this.activeKeywords = 0;
      Object.keys(keywords).forEach((key) => {
        if (keywords[key].isVisible && keywords[key].isSelected) {
          this.activeKeywords++;
        }
      });
    });
  }

  applyParams(): void {
    const filters: BucketFilters = {};
    this.filterItems.forEach((item) => {
      if (item.selectedValue) {
        filters[item.attributeName] = item.selectedValue;
      }
    });
    this.executionContext.updateFilters(filters);
  }

  emitGroupDimensions(): void {
    this.executionContext.updateGrouping(this.groupingAttributes);
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

interface FilterItem {
  label: string;
  attributeName: string;
  options: string[];
  selectedValue?: string;
}
