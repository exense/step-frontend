import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RepositoryObjectReference } from '@exense/step-core';

@Component({
  selector: 'step-plan-editor-actions',
  templateUrl: './plan-editor-actions.component.html',
  styleUrls: ['./plan-editor-actions.component.scss'],
})
export class PlanEditorActionsComponent {
  @Input() hasUndo?: boolean | null;
  @Input() hasRedo?: boolean | null;
  @Input() isInteractiveSessionActive?: boolean | null;
  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;

  @Output() discardAll = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() clone = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() startInteractive = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
}
