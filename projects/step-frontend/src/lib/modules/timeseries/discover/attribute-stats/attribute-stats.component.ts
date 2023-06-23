import { Component, Input, OnInit } from '@angular/core';
import { AttributeStats, TimeSeriesService } from '@exense/step-core';

@Component({
  selector: 'step-discover-attribute-stats',
  templateUrl: './attribute-stats.component.html',
  styleUrls: ['./attribute-stats.component.scss'],
})
export class DiscoverAttributeStatsComponent implements OnInit {
  isLoading = true;

  @Input() attributeValues!: AttributeStats[];

  ngOnInit(): void {}
}
