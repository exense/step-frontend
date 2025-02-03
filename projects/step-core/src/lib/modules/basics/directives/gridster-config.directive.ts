import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { ElementResizeDirective } from '@exense/step-core';
import { GridsterConfig, GridsterComponent } from 'angular-gridster2';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepGridsterConfig]', // Apply this directive on <gridster>
  standalone: true,
})
export class StepGridsterConfigDirective implements AfterViewInit {
  private _destroyRef = inject(DestroyRef);
  private _resizeDirective = inject(ElementResizeDirective, { optional: true, host: true });
  private _gridster = inject(GridsterComponent);
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);

  readonly options = input<GridsterConfig | undefined>(); // User-provided options (optional)

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

  constructor() {
    // it is mandatory that these
    this._gridster.options = { ...this.defaultConfig, ...(this.options() ?? {}) };
    this._gridster.optionsChanged();
  }

  ngAfterViewInit(): void {
    this._renderer.setAttribute(this._el.nativeElement, 'style', 'background-color: #fff; position: unset;');
    if (this._resizeDirective) {
      this._resizeDirective.elementResize.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.resize();
        // Perform your resize logic here
      });
    } else {
      console.warn('stepElementResize directive not found!');
    }
  }

  private resize() {
    this._gridster?.onResize();
  }
}
