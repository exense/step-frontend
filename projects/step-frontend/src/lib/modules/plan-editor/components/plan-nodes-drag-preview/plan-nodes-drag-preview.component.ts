import { Component, computed, inject } from '@angular/core';
import { DragDataService, StepCoreModule } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlDropInfo } from '../../types/control-drop-info.interface';

@Component({
  selector: 'step-plan-nodes-drag-preview',
  templateUrl: './plan-nodes-drag-preview.component.html',
  styleUrl: './plan-nodes-drag-preview.component.scss',
  imports: [StepCoreModule],
})
export class PlanNodesDragPreviewComponent {
  private _dragDataService = inject(DragDataService);

  private dragData = toSignal(this._dragDataService.dragData$, { initialValue: undefined });
  private node = computed(() => {
    const dragData = this.dragData();
    if (!dragData || typeof dragData === 'string') {
      return undefined;
    }
    return dragData as ControlDropInfo;
  });

  protected icon = computed(() => this.node()?.icon);
  protected label = computed(() => this.node()?.label);
}
