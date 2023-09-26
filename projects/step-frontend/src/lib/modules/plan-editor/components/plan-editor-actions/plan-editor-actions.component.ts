import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { RepositoryObjectReference } from '@exense/step-core';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'step-plan-editor-actions',
  templateUrl: './plan-editor-actions.component.html',
  styleUrls: ['./plan-editor-actions.component.scss'],
})
export class PlanEditorActionsComponent {
  protected _interactiveSession = inject(InteractiveSessionService);

  @Input() hasUndo?: boolean | null;
  @Input() hasRedo?: boolean | null;
  @Input() isInteractiveSessionActive?: boolean | null;
  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() showExecuteButton?: boolean;

  @Output() discardAll = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() displayHistory = new EventEmitter<void>();
  @Output() clone = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() startInteractive = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();

  @ViewChild('interactiveSessionTrigger', { read: MatMenuTrigger }) private interactiveSessionTrigger?: MatMenuTrigger;

  protected readonly captions = {
    revertAll: 'Revert all changes',
    undo: 'Undo (Ctrl + Z)',
    redo: 'Redo (Ctrl + Y)',
    history: 'Display version history',
    duplicate: 'Duplicate this plan',
    export: 'Export this plan',
    start: 'Execute this plan',
    resetInteractive: 'Reset the session of the interactive mode',
    startInteractiveShort: 'Start interactive session',
    startInteractive: 'Start an interactive session to debug this plan',
    stopInteractive: 'Stop interactive mode',
  };

  protected startInteractiveSession(): void {
    this.interactiveSessionTrigger?.closeMenu();
    this.startInteractive.emit();
  }

  protected toggleInteractiveSession(): void {
    if (this.isInteractiveSessionActive) {
      this.stop.emit();
      return;
    }

    if (this._interactiveSession.executionParameters) {
      this.interactiveSessionTrigger!.openMenu();
      return;
    }

    this.startInteractive.emit();
  }
}
