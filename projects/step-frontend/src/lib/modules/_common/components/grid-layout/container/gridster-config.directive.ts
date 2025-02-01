import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  Host,
  inject,
  Input,
  Optional,
  Renderer2,
} from '@angular/core';
import { ElementResizeDirective } from '@exense/step-core';
import { GridsterConfig, GridsterComponent } from 'angular-gridster2';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepGridsterConfig]', // Apply this directive on <gridster>
  standalone: true,
})
export class StepGridsterConfigDirective implements AfterViewInit {
  private _destroyRef = inject(DestroyRef);
  @Input() options: GridsterConfig = {}; // User-provided options (optional)

  private defaultConfig: GridsterConfig = {
    yGrid: 'onDrag&Resize',
    gridType: 'verticalFixed',
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
    minRows: 1,
    maxRows: 5,
    fixedRowHeight: 450,
  };

  constructor(
    private gridster: GridsterComponent,
    private el: ElementRef,
    @Optional() @Host() private resizeDirective: ElementResizeDirective,
  ) {
    // it is mandatory that these
    this.gridster.options = this.defaultConfig;
    this.gridster.optionsChanged();
  }

  resize() {
    this.gridster?.onResize();
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.style = 'background-color: #fff; position: unset;';
    if (this.resizeDirective) {
      this.resizeDirective.elementResize.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.resize();
        // Perform your resize logic here
      });
    } else {
      console.warn('stepElementResize directive not found!');
    }
  }
}
