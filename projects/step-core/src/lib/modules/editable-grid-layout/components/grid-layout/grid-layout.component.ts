import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GridDimensionsService } from '../../injectables/grid-dimensions.service';
import { GridDimensionsDirective } from '../../directives/grid-dimensions.directive';
import { GridElementResizerService } from '../../injectables/grid-element-resizer.service';
import { GridElementDragService } from '../../injectables/grid-element-drag.service';

@Component({
  selector: 'step-grid-layout',
  imports: [StepBasicsModule],
  templateUrl: './grid-layout.component.html',
  styleUrl: './grid-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.show-preview]': 'showPreview()',
    '[style.--style__cols-count]': '_gridDimensions.COL_COUNT',
  },
  hostDirectives: [GridDimensionsDirective],
  providers: [WidgetsPositionsStateService, GridElementResizerService, GridElementDragService],
})
export class GridLayoutComponent implements AfterViewInit {
  protected _gridDimensions = inject(GridDimensionsService);
  private _gridElementResizer = inject(GridElementResizerService);
  private _gridElementDragService = inject(GridElementDragService);

  private readonly preview = viewChild<ElementRef<HTMLDivElement>>('preview');

  protected readonly showPreview = computed(() => {
    const isResize = this._gridElementResizer.resizeInProgress();
    const isDrag = this._gridElementDragService.dragInProgress();
    return !!isResize || !!isDrag;
  });

  ngAfterViewInit(): void {
    const previewElement = untracked(() => this.preview())!.nativeElement;
    this._gridElementResizer.setupPreviewElement(previewElement);
    this._gridElementDragService.setupPreviewElement(previewElement);
  }
}
