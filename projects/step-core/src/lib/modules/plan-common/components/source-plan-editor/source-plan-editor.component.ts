import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, OnInit, viewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Subject } from 'rxjs';
import * as ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { PlansService, KeywordsService, AbstractArtefact, Plan } from '../../../../client/step-client-module';
import { DialogsService } from '../../../basics/step-basics.module';
import { AceMode } from '../../../rich-editor';
import { TreeStateService } from '../../../tree';
import { SPLIT_EXPORTS } from '../../../split';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { SourceEditorAutocompleteService } from '../../injectables/source-editor-autocomplete.service';
import { PlanEditorStrategy } from '../../types/plan-editor-strategy';
import { PlanContextApiService } from '../../injectables/plan-context-api.service';
import { PlanEditorService } from '../../injectables/plan-editor.service';
import { ArtefactTreeNode } from '../../types/artefact-tree-node';
import { PlanContext } from '../../types/plan-context.interface';
import { PlanEditorPersistenceStateService } from '../../injectables/plan-editor-persistence-state.service';
import { PlanTreeComponent } from '../plan-tree/plan-tree.component';

const EDITOR_SIZE = 'DUAL_EDITOR_SIZE';
const PLAN_SIZE = 'DUAL_PLAN_SIZE';

@Component({
  selector: 'step-source-plan-editor',
  templateUrl: './source-plan-editor.component.html',
  styleUrls: ['./source-plan-editor.component.scss'],
  imports: [StepMaterialModule, SPLIT_EXPORTS, PlanTreeComponent],
})
export class SourcePlanEditorComponent implements AfterViewInit, PlanEditorStrategy, OnInit, OnDestroy {
  private _sourceEditorAutocomplete = inject(SourceEditorAutocompleteService, { optional: true });
  private _planContextApi = inject(PlanContextApiService);
  private _planApi = inject(PlansService);
  private _keywordCallsApi = inject(KeywordsService);
  private _planEditorService = inject(PlanEditorService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _dialogs = inject(DialogsService);
  private _planEditorPersistenceState = inject(PlanEditorPersistenceStateService);

  readonly mode = input.required<AceMode>();

  /** @ViewChild('editor', { static: false }) **/
  private editorElement = viewChild<ElementRef<HTMLDivElement>>('editor');

  private editor?: ace.Ace.Editor;

  private planChange$ = new Subject<Plan>();
  private planContextInternal$ = new BehaviorSubject<PlanContext | undefined>(undefined);

  get planContext(): PlanContext | undefined {
    return this.planContextInternal$.value;
  }

  readonly planContext$ = this.planContextInternal$.asObservable();

  private updateEditorWithoutSave = false;

  protected editorSize = this._planEditorPersistenceState.getPanelSize(EDITOR_SIZE);
  protected planSize = this._planEditorPersistenceState.getPanelSize(PLAN_SIZE);

  private parseCallback = () => {
    if (this.updateEditorWithoutSave) {
      return;
    }
    this.parse();
  };

  ngAfterViewInit(): void {
    ace.require('ace/ext/language_tools');
    this.editor = ace.edit(this.editorElement()!.nativeElement);
    this.editor.getSession().getUndoManager().reset();
    this.editor.setTheme('ace/theme/chrome');
    this.editor.getSession().setMode(this.mode());
    this.editor.getSession().setUseWorker(false);
    if (this._sourceEditorAutocomplete) {
      this.editor.setOptions({
        enableBasisAutocompletion: [
          {
            getCompletions: (editor: any, session: any, pos: number, prefix: string, callback: Function) => {
              this._sourceEditorAutocomplete!.autocomplete(prefix).subscribe((parsingResult) => {
                callback(
                  null,
                  parsingResult.map((text) => ({
                    name: text,
                    value: text,
                    meta: 'Keyword',
                  })),
                );
              });
            },
          },
        ],
        enableSnippets: true,
        enableLiveAutocompletion: false,
      });
    }
    if (this.planContext) {
      const plan = this.planContext.plan;
      this.updateEditorWithoutSave = true;
      this.editor.setValue((plan as any).source, 1);
      this.updateEditorWithoutSave = false;
    }

    this.editor.getSession().on('change', this.parseCallback);

    this.editor.focus();
  }

  handleEditorSizeChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(EDITOR_SIZE, size);
  }

  handlePlanSizeChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(PLAN_SIZE, size);
  }

  addControl(artefactTypeId: string): void {
    this._dialogs
      .showErrorMsg(
        'Adding controls from this panel is not yet supported. Please refer to the documentation to find the plain text syntax of the control you want to add to your plan.',
      )
      .subscribe();
  }

  addKeywords(keywordIds: string[]): void {
    const keywrods = keywordIds.map((keywordId) =>
      this._keywordCallsApi.getFunctionById(keywordId).pipe(
        map((keyword) => {
          const keywordName = keyword?.attributes?.['name'] || '';
          const addQuotes = keywordName.includes(' ');
          let command = addQuotes ? `"${keywordName}"` : keywordName;
          if (keyword?.schema?.['properties']) {
            Object.entries(keyword?.schema?.['properties'])
              .filter(([key, value]) => !!(value as any).type)
              .forEach(([key, value]) => {
                command += ` ${key} = `;
                const valueType: string = (value as any).type;
                if (valueType === 'number' || valueType === 'integer') {
                  command += '"0"';
                } else {
                  command += '""';
                }
              });
          }
          return command;
        }),
      ),
    );

    forkJoin(keywrods)
      .pipe(map((values) => values.join('\n')))
      .subscribe((newEditorValue) => {
        const currentLine = this.editor!.getSelectionRange().end.row;
        this.editor!.session!.insert({ row: currentLine, column: 0 }, `${newEditorValue}\n`);
      });
  }

  addPlans(planIds: string[]): void {
    const plans = planIds.map((planId) =>
      this._planApi.getPlanById(planId).pipe(
        map((plan) => plan?.attributes?.['name']),
        map((planName) => `Call plan "${planName}"`),
      ),
    );

    forkJoin(plans)
      .pipe(map((values) => values.join('\n')))
      .subscribe((newEditorValue) => {
        const currentLine = this.editor!.getSelectionRange().end.row;
        this.editor!.session!.insert({ row: currentLine, column: 0 }, `${newEditorValue}\n`);
      });
  }

  init(planContext: PlanContext, selectedArtefactId?: string, updateEditor: boolean = true) {
    if (this.editor && updateEditor) {
      this.updateEditorWithoutSave = true;
      this.editor.setValue((planContext.plan as any).source, 1);
      this.updateEditorWithoutSave = false;
    }
    this.planContextInternal$.next(planContext);
    const root = planContext.plan.root;
    if (root) {
      const selectedId = selectedArtefactId || root.id!;
      this._treeState.init(root, { selectedNodeIds: [selectedId] });
    }
  }

  ngOnInit(): void {
    this._planEditorService.useStrategy(this);
  }

  ngOnDestroy(): void {
    this._planEditorService.removeStrategy();
    this.editor!.getSession().off('change', this.parseCallback);
    this.editor!.destroy();
    this.planChange$.complete();
    this.planContextInternal$.complete();
  }

  handlePlanChange(): void {
    this.planContextInternal$.next(this.planContextInternal$.value);
    this.parseCallback();
  }

  moveOut(node?: AbstractArtefact): void {}

  moveUp(node?: AbstractArtefact): void {}

  moveDown(node?: AbstractArtefact): void {}

  moveInNextSibling(node?: AbstractArtefact): void {}

  moveInPrevSibling(node?: AbstractArtefact): void {}

  delete(node?: AbstractArtefact): void {}

  copy(): void {}

  paste(node?: AbstractArtefact): void {}

  pasteAfter(node?: AbstractArtefact): void {}

  duplicate(node?: AbstractArtefact): void {}

  rename(node?: AbstractArtefact): void {}

  toggleSkip(node?: AbstractArtefact): void {}

  undo(): void {
    this.editor!.undo();
  }

  redo(): void {
    this.editor!.redo();
  }

  discardAll(): void {
    while (this.editor!.getSession().getUndoManager().hasUndo()) {
      this.editor!.undo();
    }
  }

  hasRedo$ = this.planContextInternal$.pipe(map(() => this.editor?.getSession()?.getUndoManager()?.hasRedo() ?? false));
  hasUndo$ = this.planContextInternal$.pipe(map(() => this.editor?.getSession()?.getUndoManager()?.hasUndo() ?? false));

  private parse(): void {
    const value = this.editor!.getValue();
    const plan = this.planContext?.plan;
    (plan as any)!.source = value;
    this._planApi.compilePlan(plan).subscribe((completionResult) => {
      this.editor!.getSession().clearAnnotations();
      if (completionResult.hasError) {
        const annotations = completionResult.errors!.map(
          (error) =>
            ({
              type: 'error',
              row: (error as any).line - 1,
              column: 1,
              raw: ' y is called x times',
              text: error.message,
            }) as ace.Ace.Annotation,
        );
        this.editor!.getSession().setAnnotations(annotations);
      } else {
        const context = this.planContext!;
        context.plan = completionResult.plan!;
        this._planContextApi.savePlan(context).subscribe((updatedContext) => {
          this.init(updatedContext, undefined, false);
        });
      }
    });
  }
}
