import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CanLeaveComponent, DialogsService, StepCoreModule, Tab } from '@exense/step-core';
import { Observable } from 'rxjs';
import { AiPromptDraftService } from '../../injectables/ai-prompt-draft.service';
import { AiGenerationDraft } from '../../shared';
import { AiDefineTestCasesComponent } from '../ai-define-test-cases/ai-define-test-cases.component';
import { AiPasteSpecificationComponent } from '../ai-paste-specification/ai-paste-specification.component';
import { AiPromptComponent } from '../ai-prompt/ai-prompt.component';

const AI_GENERATE_TAB = {
  GENERATE_WITH_AI: 'GENERATE_WITH_AI',
  DEFINE_TEST_CASES: 'DEFINE_TEST_CASES',
  PASTE_SPECIFICATION: 'PASTE_SPECIFICATION',
} as const;

type AiGenerateTabId = (typeof AI_GENERATE_TAB)[keyof typeof AI_GENERATE_TAB];

interface AiGenerateTab extends Tab<AiGenerateTabId> {
  readonly icon: string;
}

@Component({
  selector: 'step-ai-generate-page',
  imports: [StepCoreModule, AiPromptComponent, AiDefineTestCasesComponent, AiPasteSpecificationComponent],
  templateUrl: './ai-generate-page.component.html',
  styleUrl: './ai-generate-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AiGeneratePageComponent implements CanLeaveComponent {
  private readonly _dialogs = inject(DialogsService);
  private readonly _draftService = inject(AiPromptDraftService);
  private readonly prompt = viewChild(AiPromptComponent);
  private readonly testCases = viewChild(AiDefineTestCasesComponent);
  private readonly specification = viewChild(AiPasteSpecificationComponent);

  readonly availabilityMessage = input<string>();
  readonly generationRequested = output<AiGenerationDraft>();

  protected readonly generateWithAiTabId = AI_GENERATE_TAB.GENERATE_WITH_AI;
  protected readonly defineTestCasesTabId = AI_GENERATE_TAB.DEFINE_TEST_CASES;
  protected readonly pasteSpecificationTabId = AI_GENERATE_TAB.PASTE_SPECIFICATION;
  protected readonly tabs: AiGenerateTab[] = [
    {
      id: AI_GENERATE_TAB.GENERATE_WITH_AI,
      label: 'Generate With AI',
      icon: 'sparkles',
    },
    {
      id: AI_GENERATE_TAB.DEFINE_TEST_CASES,
      label: 'Define Test Cases',
      icon: 'list',
    },
    {
      id: AI_GENERATE_TAB.PASTE_SPECIFICATION,
      label: 'Paste A Specification',
      icon: 'file',
    },
  ];
  protected readonly activeTabId = signal<AiGenerateTabId>(AI_GENERATE_TAB.GENERATE_WITH_AI);

  private readonly consumeDraftEffect = effect(() => {
    if (this.activeTabId() !== AI_GENERATE_TAB.GENERATE_WITH_AI) {
      return;
    }

    const prompt = this.prompt();
    if (!prompt) {
      return;
    }

    const draft = this._draftService.consumeDraft();
    if (draft) {
      prompt.applyDraftIfPristine(draft);
    }
  });

  protected selectTab(tabId: AiGenerateTabId): void {
    this.activeTabId.set(tabId);
  }

  protected handleGenerationRequested(draft: AiGenerationDraft): void {
    this.generationRequested.emit(draft);
  }

  canLeave(): boolean | Observable<boolean> {
    const hasUnsavedChanges =
      !!this.prompt()?.hasUnsavedChanges() ||
      !!this.testCases()?.hasUnsavedChanges() ||
      !!this.specification()?.hasUnsavedChanges();

    return hasUnsavedChanges
      ? this._dialogs.showWarning('You have unsaved generation input. Do you want to navigate anyway?')
      : true;
  }
}
