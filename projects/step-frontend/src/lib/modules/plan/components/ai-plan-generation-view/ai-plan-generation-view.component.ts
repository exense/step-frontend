import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import {
  AiGenerateRequest,
  AiTestCaseInput,
  CanLeaveComponent,
  DialogsService,
  StepBasicsModule,
  Tab,
  TabsComponent,
} from '@exense/step-core';
import { IdeStateService } from '../../../../os-plugins/modules/ide-mode/services/ide-state.service';
import { IdeAiService } from '../../injectables/ide-ai.service';

type InputMode = 'form' | 'text';

type TestCaseForm = FormGroup<{
  name: FormControl<string>;
  spec: FormControl<string>;
  hints: FormControl<string>;
}>;

const INPUT_MODE_TABS: Tab<InputMode>[] = [
  { id: 'form', label: 'Define test cases' },
  { id: 'text', label: 'Paste a specification' },
];

@Component({
  selector: 'step-ai-plan-generation-view',
  templateUrl: './ai-plan-generation-view.component.html',
  styleUrls: ['./ai-plan-generation-view.component.scss'],
  imports: [StepBasicsModule, TabsComponent],
})
export class AiPlanGenerationViewComponent implements OnInit, CanLeaveComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _dialogs = inject(DialogsService);
  private _ai = inject(IdeAiService);
  private _ideState = inject(IdeStateService);

  protected readonly testCaseName = this._route.snapshot.data['testCaseName'] as string | undefined;
  protected readonly isRegenerate = !!this.testCaseName;
  protected readonly currentPackage = this._ideState.currentPackage;
  protected readonly configuration = this._ai.configuration;
  protected readonly isSpecMissing = signal(false);
  protected readonly isLaunching = signal(false);
  protected readonly errorMessage = signal<string | undefined>(undefined);
  protected readonly expandedTestCaseIndex = signal<number | undefined>(0);
  protected readonly uploadedFileName = signal<string | undefined>(undefined);

  protected readonly availableTabs = INPUT_MODE_TABS;
  protected selectedTab: InputMode = 'form';

  protected readonly form = new FormGroup({
    testCases: new FormArray<TestCaseForm>([this.createTestCaseGroup()]),
    specText: new FormControl('', { nonNullable: true }),
    hints: new FormControl('', { nonNullable: true }),
  });

  private allowNavigation = false;

  protected get testCases(): FormArray<TestCaseForm> {
    return this.form.controls.testCases;
  }

  protected get isTextMode(): boolean {
    return !this.isRegenerate && this.selectedTab === 'text';
  }

  protected get canGenerate(): boolean {
    if (this.isLaunching() || !this.currentPackage() || !this.configuration()?.available) {
      return false;
    }
    if (this.isTextMode) {
      return !!this.form.controls.specText.value.trim();
    }
    return this.testCases.controls.every(
      (testCase) => !!testCase.controls.name.value.trim() && !!testCase.controls.spec.value.trim(),
    );
  }

  protected get footerStatus(): string {
    if (this.isLaunching()) {
      return 'Starting the AI agent…';
    }
    if (!this.currentPackage()) {
      return 'Open an automation package to continue';
    }
    const configuration = this.configuration();
    if (!configuration) {
      return 'Checking AI availability…';
    }
    if (!configuration.available) {
      return 'AI test generation is unavailable';
    }
    if (this.isTextMode) {
      return this.form.controls.specText.value.trim()
        ? 'Test description ready to generate'
        : 'Enter a test description to continue';
    }

    const testCaseLabel = `${this.testCases.length} test case${this.testCases.length === 1 ? '' : 's'}`;
    const missingFields = this.testCases.controls.reduce((count, testCase) => {
      return count + Number(!testCase.controls.name.value.trim()) + Number(!testCase.controls.spec.value.trim());
    }, 0);
    if (missingFields) {
      return `${testCaseLabel} · ${missingFields} required field${missingFields === 1 ? '' : 's'} missing`;
    }
    return `${testCaseLabel} · Ready to ${this.isRegenerate ? 'regenerate' : 'generate'}`;
  }

  protected get generateButtonLabel(): string {
    return this.isRegenerate ? 'Regenerate test case' : 'Generate test cases';
  }

  ngOnInit(): void {
    if (!this.testCaseName) {
      return;
    }

    const testCase = this.testCases.at(0);
    testCase.patchValue({ name: this.testCaseName });
    this.form.markAsPristine();

    this._ai.getSpec(this.testCaseName).subscribe({
      next: (result) => {
        this.isSpecMissing.set(!result.exists);
        if (result.spec) {
          testCase.patchValue({ spec: result.spec });
        }
        this.form.markAsPristine();
      },
      error: () => this.isSpecMissing.set(true),
    });
  }

  canLeave(): boolean | Observable<boolean> {
    if (this.isLaunching()) {
      return false;
    }
    if (this.allowNavigation || !this.hasUnsavedInput()) {
      return true;
    }
    return this._dialogs.showWarning('You have unsaved test case input. Do you want to discard it?', {
      confirmButtonLabel: 'Discard',
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  protected warnBeforeBrowserUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedInput() || this.allowNavigation) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  }

  protected addTestCase(): void {
    this.testCases.push(this.createTestCaseGroup());
    this.expandedTestCaseIndex.set(this.testCases.length - 1);
    this.form.markAsDirty();
  }

  protected removeTestCase(index: number, event?: Event): void {
    event?.stopPropagation();
    const testCase = this.testCases.at(index).getRawValue();
    const hasInput = Object.values(testCase).some((value) => value.trim().length > 0);
    if (!hasInput) {
      this.removeTestCaseAt(index);
      return;
    }

    this._dialogs
      .showWarning('This test case contains input. Do you want to remove it?', { confirmButtonLabel: 'Remove' })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.removeTestCaseAt(index);
        }
      });
  }

  protected testCaseTitle(testCase: TestCaseForm): string {
    return testCase.controls.name.value.trim() || 'Untitled test case';
  }

  protected isTestCaseReady(testCase: TestCaseForm): boolean {
    return !!testCase.controls.name.value.trim() && !!testCase.controls.spec.value.trim();
  }

  protected testCaseStatus(testCase: TestCaseForm): string {
    const isNameMissing = !testCase.controls.name.value.trim();
    const isDescriptionMissing = !testCase.controls.spec.value.trim();
    if (isNameMissing && isDescriptionMissing) {
      return 'Name and description required';
    }
    if (isNameMissing) {
      return 'Name required';
    }
    if (isDescriptionMissing) {
      return 'Description required';
    }
    return 'Complete';
  }

  protected loadFromFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploadedFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      this.form.controls.specText.setValue(String(reader.result ?? ''));
      this.form.controls.specText.markAsDirty();
    };
    reader.readAsText(file);
    input.value = '';
  }

  protected cancel(): void {
    this._router.navigate(['/plans/list']);
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
    this._ai
      .generate(request)
      .pipe(finalize(() => this.isLaunching.set(false)))
      .subscribe({
        next: (result) => {
          this.allowNavigation = true;
          this.form.markAsPristine();
          if (result.executionId) {
            this._ai.navigateToExecution(result.executionId);
          } else {
            this.errorMessage.set('The AI agent started without returning an execution identifier');
            this.allowNavigation = false;
          }
        },
        error: (error) => this.errorMessage.set(this.extractErrorMessage(error)),
      });
  }

  private buildRequest(): AiGenerateRequest | undefined {
    if (this.isTextMode) {
      const specText = this.form.controls.specText.value.trim();
      if (!specText) {
        this.errorMessage.set('Please enter or upload a test description');
        return undefined;
      }
      return { specText, hints: this.hintsOrUndefined() };
    }

    if (this.testCases.invalid) {
      this.testCases.markAllAsTouched();
      return undefined;
    }

    const testCases: AiTestCaseInput[] = this.testCases.getRawValue().map((testCase) => ({
      name: testCase.name.trim(),
      spec: testCase.spec,
      mode: this.isRegenerate ? 'regenerate' : 'create',
      hints: testCase.hints.trim() || undefined,
    }));
    return { testCases, hints: this.hintsOrUndefined() };
  }

  private hintsOrUndefined(): string | undefined {
    return this.form.controls.hints.value.trim() || undefined;
  }

  private createTestCaseGroup(): TestCaseForm {
    return new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: Validators.required }),
      spec: new FormControl('', { nonNullable: true, validators: Validators.required }),
      hints: new FormControl('', { nonNullable: true }),
    });
  }

  private removeTestCaseAt(index: number): void {
    this.testCases.removeAt(index);
    this.expandedTestCaseIndex.set(Math.min(index, this.testCases.length - 1));
    this.form.markAsDirty();
  }

  private hasUnsavedInput(): boolean {
    if (!this.form.dirty) {
      return false;
    }
    const value = this.form.getRawValue();
    return (
      !!value.specText.trim() ||
      !!value.hints.trim() ||
      value.testCases.some((testCase) => Object.values(testCase).some((field) => field.trim().length > 0))
    );
  }

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
