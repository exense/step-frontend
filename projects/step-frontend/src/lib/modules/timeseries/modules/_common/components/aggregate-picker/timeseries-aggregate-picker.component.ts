import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';
import { ChartAggregation } from '../../types/chart-aggregation';

@Component({
  selector: 'step-timeseries-aggregate-picker',
  templateUrl: './timeseries-aggregate-picker.component.html',
  styleUrls: ['./timeseries-aggregate-picker.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class TimeseriesAggregatePickerComponent implements OnChanges {
  protected readonly ChartAggregation = ChartAggregation;

  @Input() selectedAggregate!: ChartAggregation;
  @Input() pclValue?: number;
  @Input() allowEmptyAggregate: boolean = false;

  @Output() aggregateChange: EventEmitter<{ aggregate?: ChartAggregation; pclValue?: number }> = new EventEmitter();

  readonly PCL_VALUES = [80, 90, 99];
  readonly AGGREGATES: ChartAggregation[] = [
    ChartAggregation.SUM,
    ChartAggregation.AVG,
    ChartAggregation.MAX,
    ChartAggregation.MIN,
    ChartAggregation.COUNT,
    ChartAggregation.RATE,
    ChartAggregation.MEDIAN,
  ];

  customPclValueInput?: number;

  ngOnChanges(changes: SimpleChanges): void {
    // let's set the custom PCL in the input
    const pclChange = changes['pclValue'];
    if (pclChange) {
      const currentPcl = pclChange.currentValue;
      if (!this.PCL_VALUES.find((c) => c === currentPcl)) {
        this.customPclValueInput = currentPcl;
      }
    }
  }

  applyCustomPclValue() {
    if (this.customPclValueInput && this.customPclValueInput > 0 && this.customPclValueInput < 100) {
      this.switchAggregate(ChartAggregation.PERCENTILE, this.customPclValueInput);
    }
  }

  switchAggregate(aggregate?: ChartAggregation, pclValue?: number) {
    this.aggregateChange.emit({ aggregate, pclValue });
  }
}
