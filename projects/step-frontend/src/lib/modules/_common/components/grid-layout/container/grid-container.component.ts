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
} from '@angular/core';
import { GridsterConfig, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import { StepGridItemComponent } from '../item/grid-item.component';
import { GridLayoutSettings } from './grid-layout-settings';

@Component({
  selector: 'step-gridster-container',
  template: `
    <div style="height: 1000px">
      <gridster #gridster [options]="config">
        <ng-content></ng-content>
      </gridster>
    </div>
  `,
  imports: [GridsterComponent],
  standalone: true,
})
export class StepGridContainerComponent implements AfterViewInit {
  @Input() settings: GridLayoutSettings | undefined;

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

  @ViewChild('gridsterContainer', { read: ViewContainerRef }) gridsterContainer!: ViewContainerRef;
  @ViewChild('gridster') gridster!: GridsterComponent;
  @ContentChildren(StepGridItemComponent) items!: QueryList<StepGridItemComponent>;

  private gridsterItems: ComponentRef<GridsterItemComponent>[] = [];

  ngAfterViewInit() {
    // setTimeout(() => this.gridster?.options?.api?.resize?.(), 100);
    this.createGridsterItems();
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit() {
    // Initial setup of items
    console.log('AFTER CONTENT INIT');
    this.items.changes.subscribe(() => {
      this.createGridsterItems();
    });
    // this.previousItemCount = this.items.length;
    // this.createGridsterItems();
  }

  private createGridsterItems() {
    this.gridsterContainer.clear(); // Remove existing items

    this.items.forEach((item, index) => {
      const componentRef = this.gridsterContainer.createComponent(GridsterItemComponent);
      console.log(item.x, item.y, item.width, item.height);
      componentRef.instance.item = {
        x: item.x,
        y: item.y,
        cols: item.width,
        rows: item.height,
      };
      this.cdr.detectChanges();
      componentRef.location.nativeElement.appendChild(item.content.nativeElement);

      this.gridsterItems.push(componentRef);
      this.gridster.options?.api?.optionsChanged?.();
    });
  }
}
