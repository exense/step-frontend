import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import {
  AiGenerateRequest,
  AiTestCaseInput,
  DialogRouteResult,
  StepBasicsModule,
  Tab,
  TabsComponent,
} from '@exense/step-core';
import { IdeAiService } from '../../injectables/ide-ai.service';

export interface AiPlanGenerationDialogData {
  /** When set, the dialog regenerates that single test case instead of creating new ones. */
  testCaseName?: string;
}

type DialogRef = MatDialogRef<AiPlanGenerationDialogComponent, DialogRouteResult>;

const INPUT_MODE_TABS: Tab<string>[] = [
  { id: 'form', label: 'Test case by test case' },
  { id: 'text', label: 'Paste a specification' },
];

@Component({
  selector: 'step-ai-plan-generation-dialog',
  templateUrl: './ai-plan-generation-dialog.component.html',
  styleUrls: ['./ai-plan-generation-dialog.component.scss'],
  imports: [StepBasicsModule, TabsComponent],
})
export class AiPlanGenerationDialogComponent implements OnInit {
  private _data = inject<AiPlanGenerationDialogData>(MAT_DIALOG_DATA, { optional: true });
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  private _ai = inject(IdeAiService);

  protected readonly testCaseName = this._data?.testCaseName;
  protected readonly isRegenerate = !!this._data?.testCaseName;

  protected readonly configuration = this._ai.configuration;
  protected readonly isSpecMissing = signal(false);
  protected readonly isLaunching = signal(false);
  protected readonly errorMessage = signal<string | undefined>(undefined);

  protected readonly _availableTabs = INPUT_MODE_TABS;
  // regeneration always targets one known test case, so the free text mode makes no sense there
  protected selectedTab = INPUT_MODE_TABS[0].id;

  protected readonly form = this._fb.group({
    testCases: this._fb.array([this.createTestCaseGroup()]),
    specText: this._fb.control(''),
    hints: this._fb.control(''),
  });

  protected get testCases(): FormArray {
    return this.form.controls.testCases;
  }

  ngOnInit(): void {
    if (!this.testCaseName) {
      return;
    }
    this.testCases.at(0).patchValue({ name: this.testCaseName });
    this.testCases.at(0).get('name')!.disable();
    this._ai.getSpec(this.testCaseName).subscribe({
      next: (result) => {
        this.isSpecMissing.set(!result.exists);
        if (result.spec) {
          this.testCases.at(0).patchValue({ spec: result.spec });
        }
      },
      error: () => this.isSpecMissing.set(true),
    });
  }

  protected addTestCase(): void {
    this.testCases.push(this.createTestCaseGroup());
  }

  protected removeTestCase(index: number): void {
    this.testCases.removeAt(index);
  }

  protected loadFromFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ specText: String(reader.result ?? '') });
    reader.readAsText(file);
    // allow re-selecting the same file
    input.value = '';
  }

  protected generate(): void {
    if (this.isLaunching()) {
      return;
    }
    const request = this.buildRequest();
    if (!request) {
      return;
    }

    this.isLaunching.set(true);
    this.errorMessage.set(undefined);
    this._dialogRef.disableClose = true;

    this._ai
      .generate(request)
      .pipe(
        finalize(() => {
          this.isLaunching.set(false);
          this._dialogRef.disableClose = false;
        }),
      )
      .subscribe({
        next: (result) => {
          // we navigate to the execution ourselves, so there is nothing to navigate back to
          this._dialogRef.close({ isSuccess: true, canNavigateBack: false });
          if (result.executionId) {
            this._ai.navigateToExecution(result.executionId);
          }
        },
        error: (error) => this.errorMessage.set(this.extractErrorMessage(error)),
      });
  }

  private buildRequest(): AiGenerateRequest | undefined {
    if (this.isTextMode) {
      const specText = this.form.getRawValue().specText.trim();
      if (!specText) {
        this.errorMessage.set('Please enter or upload a specification');
        return undefined;
      }
      return { specText, hints: this.hintsOrUndefined() };
    }

    if (this.testCases.invalid) {
      this.testCases.markAllAsTouched();
      return undefined;
    }
    const testCases: AiTestCaseInput[] = this.testCases.getRawValue().map((testCase: any) => ({
      name: testCase.name.trim(),
      spec: testCase.spec,
      mode: this.isRegenerate ? 'regenerate' : 'create',
      hints: testCase.hints?.trim() || undefined,
    }));
    return { testCases, hints: this.hintsOrUndefined() };
  }

  protected get isTextMode(): boolean {
    return !this.isRegenerate && this.selectedTab === 'text';
  }

  private hintsOrUndefined(): string | undefined {
    return this.form.getRawValue().hints.trim() || undefined;
  }

  private createTestCaseGroup(): FormGroup {
    return this._fb.group({
      name: this._fb.control('', Validators.required),
      spec: this._fb.control('', Validators.required),
      hints: this._fb.control(''),
    });
  }

  /**
   * The backend reports user errors as a ControllerServiceError body, which the http client exposes as the parsed
   * `error` payload. Falls back to a plain text body, then to the generic http message.
   */
  private extractErrorMessage(error: unknown): string {
    const candidate = error as { error?: unknown; message?: string };
    const body = candidate?.error;
    if (typeof body === 'string' && body) {
      return body;
    }
    const errorMessage = (body as { errorMessage?: string } | undefined)?.errorMessage;
    if (errorMessage) {
      return errorMessage;
    }
    return candidate?.message ?? 'Failed to launch the AI agent';
  }
}
