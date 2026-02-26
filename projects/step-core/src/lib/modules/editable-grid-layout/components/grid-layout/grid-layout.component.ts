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
  TemplateRef,
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
import { GridEditableService } from '../../injectables/grid-editable.service';
import { GRID_LAYOUT_CONFIG } from '../../injectables/grid-layout-config.token';
import { GridResizerComponent } from '../grid-resizer/grid-resizer.component';
import { GridElementTitleComponent } from '../grid-element-title/grid-element-title.component';
import { GridDragHandleComponent } from '../grid-drag-handle/grid-drag-handle.component';
import { GridBackgroundComponent } from '../grid-background/grid-background.component';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import { GridElementComponent } from '../grid-element/grid-element.component';
import { GridItemDirective } from '../../directives/grid-item.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { first, forkJoin, switchMap } from 'rxjs';

interface GridItem {
  widgetId: string;
  widgetType: string;
  templateRef?: TemplateRef<any>;
}

@Component({
  selector: 'step-grid-layout',
  imports: [
    StepBasicsModule,
    GridResizerComponent,
    GridElementTitleComponent,
    GridDragHandleComponent,
    GridBackgroundComponent,
    GridElementComponent,
  ],
  templateUrl: './grid-layout.component.html',
  styleUrl: './grid-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.show-preview]': 'showPreview()',
    '[class.is-resize]': 'isResize()',
    '[class.edit-mode]': '_gridEditable.editMode()',
    '[class.hidden]': '!isInitialised()',
    '[style.--style__cols-count]': '_colCount',
  },
  hostDirectives: [GridDimensionsDirective],
  providers: [GridElementResizerService, GridElementDragService],
})
export class GridLayoutComponent implements AfterViewInit {
  protected readonly _colCount = inject(GRID_COLUMN_COUNT);
  protected readonly _gridEditable = inject(GridEditableService);
  private _gridLayoutConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridElementResizer = inject(GridElementResizerService);
  private _gridElementDragService = inject(GridElementDragService);
  private _widgetsPersistenceState = inject(WidgetsPersistenceStateService);
  private _widgetPositions = inject(WidgetsPositionsStateService);

  private readonly isRenderComplete = signal(false);
  private readonly preview = viewChild<ElementRef<HTMLDivElement>>('preview');
  protected readonly isInitialised = computed(() => this._widgetsPersistenceState.isInitialized());

  protected readonly isResize = computed(() => this._gridElementResizer.resizeInProgress());

  protected readonly showPreview = computed(() => {
    const isResize = this.isResize();
    const isDrag = this._gridElementDragService.dragInProgress();
    return !!isResize || !!isDrag;
  });

  protected readonly invalidPreview = computed(() => this._gridElementDragService.dragNotApplied());

  private allWidgetTypes = this._gridLayoutConfig.defaultElementParams.map((item) => item.widgetType);

  private readonly contentWidgets = contentChildren(GridItemDirective);
  private readonly contentWidgets$ = toObservable(this.contentWidgets);
  private readonly gridTemplateItems$ = this.contentWidgets$.pipe(
    switchMap((widgets) => {
      const items = widgets.map((widget) => widget.item$.pipe(first()));
      return forkJoin(items);
    }),
  );

  private readonly gridTemplateItems = toSignal(this.gridTemplateItems$, { initialValue: [] });
  protected readonly gridItems = computed(() => {
    const gridTemplateItems = this.gridTemplateItems();
    const templateDictionary = gridTemplateItems.reduce(
      (res, item) => {
        res[item.widgetType] = item.templateRef;
        return res;
      },
      {} as Record<string, TemplateRef<any>>,
    );
    const widgetPositons = Object.values(this._widgetPositions.positions());

    const gridItems = widgetPositons.map((position) => {
      const widgetId = position.id;
      const widgetType = position.widgetType;
      const templateRef = templateDictionary[widgetType];
      return { widgetId, widgetType, templateRef } as GridItem;
    });

    return gridItems.filter((item) => !!item);
  });

  private readonly contentWidgetTypes = computed(() => {
    const items = this.gridTemplateItems();
    const ids = items.map((item) => item.widgetType);
    return new Set(ids);
  });

  protected readonly hiddenWidgetTypes = computed(() => {
    const renderedWidgetsTypes = this.contentWidgetTypes();
    return this.allWidgetTypes.filter((widgetType) => !renderedWidgetsTypes.has(widgetType));
  });

  private effectHiddenWidgetsChange = effect(() => {
    const hiddenWidgetTypes = this.hiddenWidgetTypes();
    const isRenderComplete = this.isRenderComplete();
    if (isRenderComplete) {
      this._widgetPositions.setNotRenderedWidgets(hiddenWidgetTypes);
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
