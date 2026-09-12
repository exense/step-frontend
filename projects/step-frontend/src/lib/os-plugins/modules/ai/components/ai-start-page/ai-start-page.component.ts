import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { NavigatorService, StepCoreModule } from '@exense/step-core';
import { AiPromptDraftService } from '../../injectables/ai-prompt-draft.service';
import {
  AI_COMMUNITY_URL,
  AI_DOCUMENTATION_URL,
  AI_GENERATE_PATH,
  AI_HELP_CARDS,
  AiGenerationInputType,
  AiGenerationMode,
  AiPromptDraft,
} from '../../shared';
import { AiPromptComponent } from '../ai-prompt/ai-prompt.component';

interface AiPromptExample {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  readonly icon: string;
  readonly mode: AiGenerationMode;
}

const AI_PROMPT_EXAMPLES: readonly AiPromptExample[] = [
  {
    id: 'rpa-invoice-sap',
    label: 'RPA: Extract data from invoice PDFs and update SAP',
    prompt: 'Extract data from invoice PDFs and update SAP.',
    icon: 'agent',
    mode: AiGenerationMode.RPA,
  },
  {
    id: 'load-test-login-checkout',
    label: 'Load test: Simulate 500 users on login and checkout flows',
    prompt: 'Simulate 500 users on login and checkout flows.',
    icon: 'bar-chart',
    mode: AiGenerationMode.LOAD_TEST,
  },
];

@Component({
  selector: 'step-ai-start-page',
  imports: [AiPromptComponent, StepCoreModule],
  templateUrl: './ai-start-page.component.html',
  styleUrl: './ai-start-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiStartPageComponent {
  private readonly _draftService = inject(AiPromptDraftService);
  private readonly _navigator = inject(NavigatorService);
  private readonly prompt = viewChild.required(AiPromptComponent);

  protected readonly helpCards = AI_HELP_CARDS;
  protected readonly promptExamples = AI_PROMPT_EXAMPLES;
  protected readonly documentationUrl = AI_DOCUMENTATION_URL;
  protected readonly communityUrl = AI_COMMUNITY_URL;

  protected applyExample(example: AiPromptExample): void {
    this.prompt().applyDraft({
      type: AiGenerationInputType.PROMPT,
      prompt: example.prompt,
      mode: example.mode,
    });
  }

  protected generatePlan(draft: AiPromptDraft): void {
    this._draftService.setDraft(draft);
    this._navigator.navigate(`${AI_GENERATE_PATH}/generate`);
  }
}
