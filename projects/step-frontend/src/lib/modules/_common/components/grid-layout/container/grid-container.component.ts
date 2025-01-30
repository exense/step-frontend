import {
  Component,
  ContentChildren,
  Input,
  QueryList,
  AfterViewInit,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  ChangeDetectorRef,
  forwardRef,
  Optional,
  Inject,
  Provider,
} from '@angular/core';
import { GridsterConfig, GridsterComponent, GridsterModule } from 'angular-gridster2';
import { GridLayoutSettings } from './grid-layout-settings';

export const GRIDSTER_PROVIDER: Provider = {
  provide: GridsterComponent,
  useFactory: (gridster: GridsterComponent) => gridster,
  deps: [[new Inject(forwardRef(() => GridsterComponent)), new Optional()]],
};

@Component({
  selector: 'step-gridster-container',
  template: `
    <div style="height: 1000px">
      <gridster #gridster [options]="config">
        <!--        @if (gridsterReady) {-->
        <ng-content></ng-content>
        <!--        }-->
      </gridster>
    </div>
  `,
  imports: [GridsterModule],
  providers: [GRIDSTER_PROVIDER],
  standalone: true,
})
export class StepGridContainerComponent implements AfterViewInit {
  @Input() settings: GridLayoutSettings | undefined;

  gridsterReady = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.gridsterReady = true;
    }, 10000);
  }

  config: GridsterConfig = {
    yGrid: 'onDrag&Resize',
    compactType: 'compactUp',
    draggable: { enabled: true, dragHandleClass: 'drag-icon', ignoreContent: true },
    resizable: { enabled: false },
    disableScrollHorizontal: true,
    pushItems: true,
    swap: true,
    enableBoundaryControl: true, // don't allow elements to get out of the container while dragging
    margin: 12,
    minCols: 4,
    maxCols: 4,
    minRows: 2,
    maxRows: 2,
    fixedRowHeight: 450,
  };
}
