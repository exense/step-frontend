import { Component, EventEmitter, inject, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  PlanContext,
  RepositoryObjectReference,
  ViewRegistryService,
  ExecutiontTaskParameters,
} from '@exense/step-core';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'step-plan-editor-actions',
  templateUrl: './plan-editor-actions.component.html',
  styleUrls: ['./plan-editor-actions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlanEditorActionsComponent {
  protected _interactiveSession = inject(InteractiveSessionService);

  readonly _planActions = inject(ViewRegistryService).getDashlets('plan/editorActions');
  readonly _planExecutionActions = inject(ViewRegistryService).getDashlets('plan/editorExecutionActions');

  @Input() planContext?: PlanContext | null;
  @Input() hasUndo?: boolean | null;
  @Input() hasRedo?: boolean | null;
  @Input() isInteractiveSessionActive?: boolean | null;
  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() showExecuteButton?: boolean;
  @Input() showExportSourceButton?: boolean;

  @Output() discardAll = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() clone = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() startInteractive = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() showSource = new EventEmitter<void>();
  @Output() scheduleTask = new EventEmitter<ExecutiontTaskParameters>();

  @ViewChild('interactiveSessionTrigger', { read: MatMenuTrigger }) private interactiveSessionTrigger?: MatMenuTrigger;

  protected readonly captions = {
    revertAll: 'Revert all changes',
    undo: 'Undo (Ctrl + Z)',
    redo: 'Redo (Ctrl + Y)',
    duplicate: 'Duplicate this plan',
    showSource: "Show plan's YAML source",
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
