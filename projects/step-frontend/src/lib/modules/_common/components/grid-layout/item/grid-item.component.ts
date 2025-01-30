import { Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { GridsterComponent, GridsterItemComponent, GridsterModule } from 'angular-gridster2';

@Component({
  selector: 'step-grid-item',
  template: `
    <div #content>
      <ng-content></ng-content>
    </div>
  `,
  imports: [GridsterModule],
  providers: [GridsterComponent],
  standalone: true,
})
export class StepGridItemComponent {
  @ViewChild('content', { static: true }) content!: ElementRef;

  @Input() width!: number;
  @Input() height!: number;
  @Input() x!: number;
  @Input() y!: number;
}
