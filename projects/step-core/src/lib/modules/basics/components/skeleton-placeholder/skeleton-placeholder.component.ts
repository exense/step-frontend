import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'step-skeleton-placeholder',
  imports: [],
  templateUrl: './skeleton-placeholder.component.html',
  styleUrl: './skeleton-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPlaceholderComponent {}
