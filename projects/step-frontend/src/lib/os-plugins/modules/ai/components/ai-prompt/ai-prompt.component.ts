import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { StepCoreModule } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AiGenerationInputType, AiGenerationMode, AiPromptDraft, AI_PROMPT_MAX_LENGTH } from '../../shared';

interface AiGenerationModeOption {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly mode: AiGenerationMode | null;
  readonly isDisabled: boolean;
}

type AiPromptAppearance = 'default' | 'start-page';

const PROMPT_REQUIRED_VALIDATOR: ValidatorFn = (control) =>
  !!String(control.value ?? '').trim() ? null : { required: true };

const AI_GENERATION_MODE_OPTIONS: readonly AiGenerationModeOption[] = [
  {
    id: 'auto',
    label: 'Auto',
    icon: 'sparkles',
    mode: AiGenerationMode.AUTO,
    isDisabled: false,
  },
  {
    id: 'rpa',
    label: 'RPA',
    icon: 'agent',
    mode: AiGenerationMode.RPA,
    isDisabled: false,
  },
  {
    id: 'load-test',
    label: 'Load Test',
    icon: 'bar-chart',
    mode: AiGenerationMode.LOAD_TEST,
    isDisabled: false,
  },
  {
    id: 'more-soon',
    label: 'More Soon',
    icon: 'sparkles',
    mode: null,
    isDisabled: true,
  },
];

@Component({
  selector: 'step-ai-prompt',
  imports: [StepCoreModule],
  templateUrl: './ai-prompt.component.html',
  styleUrl: './ai-prompt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AiPromptComponent {
  private readonly _formBuilder = inject(FormBuilder);

  readonly heading = input('Describe What You Want To Automate');
  readonly supportingText = input('Include the behavior, data, and any relevant instructions for the AI agent.');
  readonly placeholder = input('Describe what you want to automate or test...');
  readonly actionLabel = input('Generate Plan');
  readonly appearance = input<AiPromptAppearance>('default');
  readonly generationRequested = output<AiPromptDraft>();

  protected readonly promptControl = this._formBuilder.control('', {
    nonNullable: true,
    validators: [PROMPT_REQUIRED_VALIDATOR, Validators.maxLength(AI_PROMPT_MAX_LENGTH)],
  });
  protected readonly modeControl = this._formBuilder.control<AiGenerationMode>(AiGenerationMode.AUTO, {
    nonNullable: true,
  });
  protected readonly maxPromptLength = AI_PROMPT_MAX_LENGTH;
  protected readonly modeOptions = AI_GENERATION_MODE_OPTIONS;
  protected readonly promptErrorsDictionary: Record<string, string> = {
    required: 'Enter a description of what you want to automate.',
    maxlength: `Keep the description within ${AI_PROMPT_MAX_LENGTH.toLocaleString()} characters.`,
  };

  private readonly promptInput = viewChild.required<ElementRef<HTMLTextAreaElement>>('promptInput');
  private readonly promptValue = toSignal(this.promptControl.valueChanges, {
    initialValue: this.promptControl.value,
  });

  protected readonly promptLength = computed(() => this.promptValue().length);

  hasUnsavedChanges(): boolean {
    return this.promptControl.dirty || this.modeControl.dirty;
  }

  applyDraft(draft: AiPromptDraft): void {
    this.promptControl.setValue(draft.prompt);
    this.modeControl.setValue(draft.mode);
    this.promptControl.markAsDirty();
    this.modeControl.markAsDirty();
  }

  applyDraftIfPristine(draft: AiPromptDraft): boolean {
    if (this.hasUnsavedChanges() || !!this.promptControl.value) {
      return false;
    }

    this.applyDraft(draft);
    return true;
  }

  protected submit(): void {
    this.promptControl.markAsTouched();
    this.promptControl.updateValueAndValidity();

    if (this.promptControl.invalid) {
      this.promptInput().nativeElement.focus();
      return;
    }

    this.generationRequested.emit({
      type: AiGenerationInputType.PROMPT,
      prompt: this.promptControl.value.trim(),
      mode: this.modeControl.value,
    });
  }
}
