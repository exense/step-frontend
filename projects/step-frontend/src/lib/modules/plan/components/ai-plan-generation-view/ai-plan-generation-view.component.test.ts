import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { DialogsService } from '@exense/step-core';
import { IdeStateService } from '../../../../os-plugins/modules/ide-mode/services/ide-state.service';
import { IdeAiService } from '../../injectables/ide-ai.service';
import { AiPlanGenerationViewComponent } from './ai-plan-generation-view.component';

describe('AiPlanGenerationViewComponent', () => {
  let fixture: ComponentFixture<AiPlanGenerationViewComponent>;
  let component: any;
  let routeData: Record<string, unknown>;
  let ai: {
    configuration: ReturnType<typeof signal>;
    getSpec: jest.Mock;
    generate: jest.Mock;
    navigateToExecution: jest.Mock;
  };
  let dialogs: { showWarning: jest.Mock };
  let router: { navigate: jest.Mock };
  let ideState: {
    currentPackage: ReturnType<typeof signal>;
    inProgress: ReturnType<typeof signal>;
    reload: jest.Mock;
  };

  beforeEach(async () => {
    routeData = {};
    ai = {
      configuration: signal({ available: true, apiKeyConfigured: true }),
      getSpec: jest.fn(() => of({ exists: false })),
      generate: jest.fn(() => of({ executionId: 'execution-1' })),
      navigateToExecution: jest.fn(),
    };
    dialogs = { showWarning: jest.fn(() => of(true)) };
    router = { navigate: jest.fn() };
    ideState = {
      currentPackage: signal({ name: 'Payments', directory: 'C:\\work\\payments' }),
      inProgress: signal(false),
      reload: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AiPlanGenerationViewComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData } } },
        { provide: Router, useValue: router },
        { provide: DialogsService, useValue: dialogs },
        { provide: IdeAiService, useValue: ai },
        { provide: IdeStateService, useValue: ideState },
      ],
    }).compileComponents();
  });

  const createComponent = async () => {
    fixture = TestBed.createComponent(AiPlanGenerationViewComponent);
    component = fixture.componentInstance as any;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('shows the package context and the renamed form language', async () => {
    await createComponent();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Generating into');
    expect(text).toContain('Payments');
    expect(text).toContain('C:\\work\\payments');
    expect(text).toContain('Define test cases');
    expect(text).toContain('Paste a specification');
    expect(text).toContain('Test description');
    expect(text).toContain('Test-specific instructions');
    expect(text).toContain('Advanced options · Shared automation instructions');
    expect(text).toContain('Add another test case');
    expect(text).toContain('Generate test cases');
    expect(text).not.toContain('Reload the automation package once the run has completed');
  });

  it('summarizes missing fields and only enables generation when the current mode is ready', async () => {
    await createComponent();

    const generateButton = fixture.nativeElement.querySelector('[data-step-testid="ai-generate-btn"]');
    const validationSummary = () =>
      fixture.nativeElement.querySelector('[data-step-testid="ai-validation-summary"]').textContent.trim();
    expect(generateButton.disabled).toBe(true);
    expect(validationSummary()).toBe('1 test case · 2 required fields missing');
    expect(fixture.nativeElement.textContent).toContain('Untitled test case');
    expect(fixture.nativeElement.textContent).not.toContain('1. Untitled test case');
    expect(fixture.nativeElement.textContent).toContain('Name and description required');
    expect(fixture.nativeElement.querySelector('.test-case-status.incomplete')).not.toBeNull();

    component.testCases.at(0).patchValue({ name: 'Checkout', spec: 'Complete a card payment' });
    fixture.detectChanges();

    expect(generateButton.disabled).toBe(false);
    expect(validationSummary()).toBe('1 test case · Ready to generate');
    expect(fixture.nativeElement.textContent).toContain('Checkout');
    expect(fixture.nativeElement.textContent).not.toContain('1. Checkout');
    expect(fixture.nativeElement.querySelector('.test-case-status.complete').textContent).toContain('Complete');

    component.selectedTab = 'text';
    fixture.detectChanges();
    expect(generateButton.disabled).toBe(true);
    expect(validationSummary()).toBe('Enter a test description to continue');

    component.form.controls.specText.setValue('## Checkout\nComplete a card payment');
    fixture.detectChanges();
    expect(generateButton.disabled).toBe(false);
    expect(validationSummary()).toBe('Test description ready to generate');
  });

  it('renders an English file picker independent of the browser locale', async () => {
    await createComponent();

    component.selectedTab = 'text';
    fixture.detectChanges();

    const fileInput = fixture.nativeElement.querySelector('[data-step-testid="ai-spec-file"]');
    expect(fileInput.hidden).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Choose file');
    expect(fixture.nativeElement.textContent).toContain('No file selected');

    component.uploadedFileName.set('checkout.md');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('checkout.md');
  });

  it('adds and removes collapsible test case cards', async () => {
    await createComponent();

    component.addTestCase();
    fixture.detectChanges();
    expect(component.testCases.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.test-case-card')).toHaveLength(2);
    expect(component.expandedTestCaseIndex()).toBe(1);
    expect(fixture.nativeElement.querySelector('.remove-test-case').getAttribute('aria-label')).toBe(
      'Remove Untitled test case',
    );

    component.removeTestCase(1);
    fixture.detectChanges();
    expect(component.testCases.length).toBe(1);
  });

  it('preserves the values of both input modes when switching', async () => {
    await createComponent();

    component.testCases.at(0).setValue({
      name: 'Structured login',
      spec: 'Use the login form',
      hints: 'Use Chrome',
    });
    component.selectedTab = 'text';
    component.form.controls.specText.setValue('## Pasted login\nUse the pasted flow');
    component.form.controls.specText.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.specText.value).toContain('Pasted login');
    component.selectedTab = 'form';
    fixture.detectChanges();
    expect(component.testCases.at(0).getRawValue()).toEqual({
      name: 'Structured login',
      spec: 'Use the login form',
      hints: 'Use Chrome',
    });
  });

  it('maps structured fields to the existing generation request and opens the execution', async () => {
    await createComponent();

    component.testCases.at(0).setValue({
      name: ' Login ',
      spec: 'Open the login page',
      hints: ' Prefer stable selectors ',
    });
    component.form.controls.hints.setValue(' Reuse shared authentication ');
    component.generate();

    expect(ai.generate).toHaveBeenCalledWith({
      testCases: [
        {
          name: 'Login',
          spec: 'Open the login page',
          mode: 'create',
          hints: 'Prefer stable selectors',
        },
      ],
      hints: 'Reuse shared authentication',
    });
    expect(ai.navigateToExecution).toHaveBeenCalledWith('execution-1');
  });

  it('maps pasted specification mode without discarding structured input', async () => {
    await createComponent();

    component.testCases.at(0).patchValue({ name: 'Kept test', spec: 'Kept description' });
    component.selectedTab = 'text';
    component.form.controls.specText.setValue('  ## Pasted test\nDo something  ');
    component.form.controls.hints.setValue(' Shared instruction ');
    component.generate();

    expect(ai.generate).toHaveBeenCalledWith({
      specText: '## Pasted test\nDo something',
      hints: 'Shared instruction',
    });
    expect(component.testCases.at(0).controls.name.value).toBe('Kept test');
  });

  it('loads a stored description and sends regeneration mode', async () => {
    routeData['testCaseName'] = 'Existing test';
    ai.getSpec.mockReturnValue(of({ exists: true, spec: 'Stored description' }));
    await createComponent();

    expect(ai.getSpec).toHaveBeenCalledWith('Existing test');
    const nameInput = fixture.nativeElement.querySelector('[data-step-testid="ai-test-case-name"]');
    const nameField = nameInput.closest('step-form-field');
    expect(component.testCases.at(0).controls.name.disabled).toBe(false);
    expect(nameInput.readOnly).toBe(true);
    expect(nameField.querySelector('.label-container').classList).not.toContain('show-required-marker');
    expect(nameField.textContent).toContain('read-only when regenerating');
    expect(component.testCases.at(0).controls.spec.value).toBe('Stored description');
    expect(fixture.nativeElement.textContent).toContain(
      'Regenerating replaces the existing automated test case with the newly generated version.',
    );
    expect(fixture.nativeElement.textContent).toContain('Regenerate test case');
    expect(fixture.nativeElement.textContent).toContain('1 test case · Ready to regenerate');

    component.generate();
    expect(ai.generate.mock.calls[0][0].testCases[0].mode).toBe('regenerate');
  });

  it('warns before abandoning meaningful dirty input', async () => {
    await createComponent();

    expect(component.canLeave()).toBe(true);
    component.testCases.at(0).controls.name.setValue('Unsaved test');
    component.testCases.at(0).controls.name.markAsDirty();
    component.form.markAsDirty();

    const result$ = component.canLeave();
    expect(dialogs.showWarning).toHaveBeenCalledWith('You have unsaved test case input. Do you want to discard it?', {
      confirmButtonLabel: 'Discard',
    });
    result$.subscribe((confirmed: boolean) => expect(confirmed).toBe(true));
  });
});
