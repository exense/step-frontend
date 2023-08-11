import { Component, Input } from '@angular/core';
import { AttributeStats } from '@exense/step-core';

@Component({
  selector: 'step-discover-attribute-stats',
  templateUrl: './attribute-stats.component.html',
  styleUrls: ['./attribute-stats.component.scss'],
})
export class DiscoverAttributeStatsComponent {
  isLoading = true;

  @Input() attributeValues!: AttributeStats[];
}
