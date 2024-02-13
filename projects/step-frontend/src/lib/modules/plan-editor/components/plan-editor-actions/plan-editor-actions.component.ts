import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Dashlet, Plan, PlanEditorContext, RepositoryObjectReference, ViewRegistryService } from '@exense/step-core';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'step-plan-editor-actions',
  templateUrl: './plan-editor-actions.component.html',
  styleUrls: ['./plan-editor-actions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlanEditorActionsComponent implements OnChanges {
  protected _interactiveSession = inject(InteractiveSessionService);

  readonly _planActions = inject(ViewRegistryService).getDashlets('plan/editorActions');
  readonly trackByDashlet: TrackByFunction<Dashlet> = (index, item) => item.id;

  protected planEditorContext: PlanEditorContext = {};

  @Input() currentPlanId?: string;
  @Input() plan?: Plan | null;
  @Input() compositeId?: string;

  @Input() hasUndo?: boolean | null;
  @Input() hasRedo?: boolean | null;
  @Input() isInteractiveSessionActive?: boolean | null;
  @Input() description?: string;
  @Input() repositoryObjectRef?: RepositoryObjectReference;
  @Input() showExecuteButton?: boolean;

  @Output() discardAll = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() clone = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() startInteractive = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() showSource = new EventEmitter<void>();

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

  ngOnChanges(changes: SimpleChanges): void {
    let currentPlanId: string | undefined;
    let plan: Plan | undefined;
    let compositeId: string | undefined;

    const cCurrentPlanId = changes['currentPlanId'];
    if (cCurrentPlanId?.previousValue !== cCurrentPlanId?.currentValue || cCurrentPlanId?.firstChange) {
      currentPlanId = cCurrentPlanId?.currentValue;
    }

    const cPlan = changes['plan'];
    if (cPlan?.previousValue !== cPlan?.currentValue || cPlan?.firstChange) {
      plan = cPlan?.currentValue;
    }

    const cCompositeId = changes['compositeId'];
    if (cCompositeId?.previousValue !== cCompositeId?.currentValue || cCompositeId?.firstChange) {
      compositeId = cCompositeId?.currentValue;
    }

    if (currentPlanId || plan || compositeId) {
      this.setupContext(currentPlanId, plan, compositeId);
    }
  }

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

  private setupContext(currentPlanId?: string, plan?: Plan, compositeId?: string): void {
    currentPlanId = currentPlanId ?? this.currentPlanId;
    plan = plan ?? this.plan ?? undefined;
    compositeId = compositeId ?? this.compositeId;

    this.planEditorContext = {
      currentPlanId,
      plan,
      compositeId,
    };
  }
}
