import {
  afterNextRender,
  AfterViewInit,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GridDimensionsDirective } from '../../directives/grid-dimensions.directive';
import { GridElementResizerService } from '../../injectables/grid-element-resizer.service';
import { GridElementDragService } from '../../injectables/grid-element-drag.service';
import { GRID_COLUMN_COUNT } from '../../injectables/grid-column-count.token';
import { GridEditableDirective } from '../../directives/grid-editable.directive';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { GRID_LAYOUT_CONFIG } from '../../injectables/grid-layout-config.token';
import { GridElementDirective } from '../../directives/grid-element.directive';
import { GridResizerComponent } from '../grid-resizer/grid-resizer.component';
import { GridDragHandleDirective } from '../../directives/grid-drag-handle.directive';
import { GridElementTitleComponent } from '../grid-element-title/grid-element-title.component';

@Component({
  selector: 'step-grid-layout',
  imports: [
    StepBasicsModule,
    GridElementDirective,
    GridResizerComponent,
    GridDragHandleDirective,
    GridElementTitleComponent,
  ],
  templateUrl: './grid-layout.component.html',
  styleUrl: './grid-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.show-preview]': 'showPreview()',
    '[class.edit-mode]': '_gridEditable.editMode()',
    '[class.hidden]': '!isInitialised()',
    '[style.--style__cols-count]': '_colCount',
  },
  hostDirectives: [
    GridDimensionsDirective,
    {
      directive: GridEditableDirective,
      inputs: ['editMode'],
    },
  ],
  providers: [WidgetsPositionsStateService, GridElementResizerService, GridElementDragService],
})
export class GridLayoutComponent implements AfterViewInit {
  protected readonly _colCount = inject(GRID_COLUMN_COUNT);
  protected readonly _gridEditable = inject(GridEditableService);
  private _gridLayoutConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridElementResizer = inject(GridElementResizerService);
  private _gridElementDragService = inject(GridElementDragService);
  private _widgetPositions = inject(WidgetsPositionsStateService);

  private readonly isRenderComplete = signal(false);
  private readonly preview = viewChild<ElementRef<HTMLDivElement>>('preview');
  protected readonly isInitialised = computed(() => this._widgetPositions.isInitialized());

  protected readonly showPreview = computed(() => {
    const isResize = this._gridElementResizer.resizeInProgress();
    const isDrag = this._gridElementDragService.dragInProgress();
    return !!isResize || !!isDrag;
  });

  protected readonly invalidPreview = computed(() => this._gridElementDragService.dragNotApplied());

  private allWidgets = this._gridLayoutConfig.defaultElementParams.map((item) => item.id);
  private readonly renderedWidgets = contentChildren(GridElementDirective);
  private readonly renderedWidgetsIds = computed(() => {
    const renderedWidgets = this.renderedWidgets();
    const ids = renderedWidgets.map((item) => untracked(() => item.elementId()));
    return new Set(ids);
  });

  protected readonly hiddenWidgets = computed(() => {
    const renderedWidgetsIds = this.renderedWidgetsIds();
    return this.allWidgets.filter((id) => !renderedWidgetsIds.has(id));
  });

  private effectHiddenWidgetsChange = effect(() => {
    const hiddenWidgets = this.hiddenWidgets();
    const isRenderComplete = this.isRenderComplete();
    if (isRenderComplete) {
      this._widgetPositions.setHiddenWidgets(hiddenWidgets);
    }
  });

  constructor() {
    afterNextRender(() => this.isRenderComplete.set(true));
  }

  ngAfterViewInit(): void {
    const previewElement = untracked(() => this.preview())!.nativeElement;
    this._gridElementResizer.setupPreviewElement(previewElement);
    this._gridElementDragService.setupPreviewElement(previewElement);
  }
}
