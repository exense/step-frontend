import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { ExecutionContext } from '../../execution-page/execution-context';
import { BucketFilters } from '../../model/bucket-filters';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../../execution-page/time-series-keywords.context';
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
    { label: 'Status', attributeName: 'rnStatus', options: ['PASSED','FAILED','TECHNICAL_ERROR','INTERRUPTED'] },
  ];

  groupingOptions = [
    { label: 'Name', attributes: ['name'] },
    { label: 'Name & Status', attributes: ['name', 'rnStatus'] },
  ];
  groupingAttributes = this.groupingOptions[0].attributes;

  @Input() executionContext!: ExecutionContext;
  private keywordsService!: TimeSeriesKeywordsContext;
  keywords: { [key: string]: KeywordSelection } = {};

  activeKeywords = 0;

  constructor(private executionPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.executionContext) {
      throw new Error('Context parameter is mandatory');
    }
  }

  getAllFilterAttributes() {
    return this.filterItems.map((item) => item.attributeName);
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
}

interface FilterItem {
  label: string;
  attributeName: string;
  options: string[];
  selectedValue?: string;
}
