import { Component, Input } from '@angular/core';
import { AttributeStats } from '@exense/step-core';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';

@Component({
  selector: 'step-discover-attribute-stats',
  templateUrl: './attribute-stats.component.html',
  styleUrls: ['./attribute-stats.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class DiscoverAttributeStatsComponent {
  @Input() attributeValues!: AttributeStats[];
}
