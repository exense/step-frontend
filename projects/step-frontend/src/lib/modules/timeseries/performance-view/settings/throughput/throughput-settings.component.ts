import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ThroughputMetricType } from '../../../model/throughput-metric-type';
import { Bucket } from '../../../bucket';

@Component({
  selector: 'step-throughput-chart-settings',
  templateUrl: './throughput-settings.component.html',
  styleUrls: ['./throughput-settings.component.scss'],
})
export class ThroughputSettingsComponent implements OnInit {
  @Output() onMetricChanged = new EventEmitter<{ label: string; mapFunction: (b: Bucket) => number }>();

  metrics: ThroughputMetric[] = [
    { label: ThroughputMetricType.TPH, mapFunction: (b: Bucket) => b.sum / b.count },
    { label: ThroughputMetricType.TPM, mapFunction: (b: Bucket) => b.sum / b.count },
    { label: ThroughputMetricType.TPS, mapFunction: (b: Bucket) => b.sum / b.count },
  ];
  selectedMetric = this.metrics[0];

  ngOnInit(): void {}

  selectMetric(metric: ThroughputMetric) {
    this.selectedMetric = metric;
    this.onMetricChanged.emit(metric);
  }
}

export interface ThroughputMetric {
  label: ThroughputMetricType;
  mapFunction: (b: Bucket) => number;
}
