import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'step-plan-tree-actions',
  templateUrl: './plan-tree-actions.component.html',
  styleUrls: ['./plan-tree-actions.component.scss'],
})
export class PlanTreeActionsComponent {
  @Input() isReadonly?: boolean | null;
  @Input() isInteractiveSessionActive?: boolean | null;

  @Output() moveUp = new EventEmitter<void>();
  @Output() moveDown = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() paste = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() runInteractively = new EventEmitter<void>();
}
