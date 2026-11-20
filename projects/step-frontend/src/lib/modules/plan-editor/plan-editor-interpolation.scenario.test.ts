import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  AbstractArtefact,
  ArtefactService,
  AuthService,
  AugmentedPlansService,
  AugmentedScreenService,
  DRAG_DROP_EXPORTS,
  DynamicFormsModule,
  DynamicValueString,
  FunctionActionsService,
  LOCAL_STORAGE,
  PlanContext,
  PlanContextApiService,
  PlansService,
  PlanTreeComponent,
  provideTestStepApi,
  SCREEN_WIDTH,
} from '@exense/step-core';
import { EchoComponent } from '../artefacts/component/echo/echo.component';
import { EchoArtefact } from '../artefacts/types/echo.artefact';
import { SetArtefact } from '../artefacts/types/set.artefact';
import { PlanCommonTreeEditorFormComponent } from './components/plan-common-tree-editor-form/plan-common-tree-editor-form.component';
import { PlanEditorBaseComponent } from './components/plan-editor-base/plan-editor-base.component';

const PREVIOUS_PRODUCT = 'previous.first_product_id';
const KEYWORD_PRODUCT = 'output.first_product_id';
const PLAN_VARIABLE = 'myVar';
const KEYWORD_SCOPE = 'Inspect keyword output';
const FOLLOWING_SIBLING = 'Show order status';
const PLAIN_HELP = 'placeholder syntax';
const GROOVY_HELP = 'Groovy expression';
const FIXTURE_EXPRESSIONS = [PREVIOUS_PRODUCT, KEYWORD_PRODUCT, PLAN_VARIABLE];

@Component({
  imports: [DynamicFormsModule, FormsModule],
  template: `
    <div data-testid="standalone-field">
      <step-dynamic-textfield label="Standalone text" [(ngModel)]="value" />
      <step-dynamic-textfield label="Number" [isNumber]="true" [ngModel]="number" />
      <step-dynamic-textfield label="Password" [isPassword]="true" [ngModel]="password" />
    </div>
  `,
})
class StandaloneFieldsComponent {
  protected value: DynamicValueString = { dynamic: false, value: '' };
  protected readonly number = { dynamic: false, value: 2 };
  protected readonly password = { dynamic: false, value: 'secret' };
}

function artefact(id: string, type: string, name: string): AbstractArtefact {
  return {
    id,
    _class: type,
    attributes: { name },
    dynamicName: { dynamic: false },
    useDynamicName: false,
    children: [],
  };
}

function echo(id: string, name: string, text: DynamicValueString): EchoArtefact {
  return { ...artefact(id, 'Echo', name), text };
}

function normalize(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function visibleText(container: HTMLElement, text: string): HTMLElement | undefined {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find((element) => {
    if (element.closest('[hidden], [aria-hidden="true"]')) {
      return false;
    }
    return (
      normalize(element.textContent) === text &&
      !Array.from(element.children).some((child) => normalize(child.textContent) === text)
    );
  });
}

function describedPanel(input: HTMLInputElement, help: string): HTMLElement | undefined {
  return (input.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .find((element): element is HTMLElement => !!element && normalize(element.textContent).includes(help));
}

function shownExpressions(container: HTMLElement): string[] {
  return FIXTURE_EXPRESSIONS.filter((expression) => !!visibleText(container, expression));
}

describe('Plan editor interpolation suggestions', () => {
  let fixture: ComponentFixture<PlanEditorBaseComponent>;
  let sibling: EchoArtefact;

  function settle(): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    tick(500);
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  }

  function selectNode(name: string): void {
    const node = visibleText(fixture.nativeElement, name);
    expect(node).toBeDefined();
    node!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    settle();
  }

  function textbox(): HTMLInputElement {
    const editor: HTMLElement = fixture.nativeElement;
    const textboxes = editor.querySelectorAll<HTMLInputElement>('input[type="text"]');
    expect(textboxes).toHaveLength(1);
    return textboxes[0];
  }

  function openPlan(text: DynamicValueString = { dynamic: false, value: '' }): HTMLInputElement {
    sibling = echo('show-order', FOLLOWING_SIBLING, text);
    const setVariable: SetArtefact = {
      ...artefact('set-variable', 'Set', 'Set plan variable'),
      key: { dynamic: false, value: PLAN_VARIABLE },
      value: { dynamic: false, value: 'available' },
    };
    const root = {
      ...artefact('checkout-root', 'Sequence', 'Checkout sequence'),
      children: [
        setVariable,
        {
          ...artefact('list-products', 'CallKeyword', 'List products'),
          after: { steps: [echo('inspect-output', KEYWORD_SCOPE, { dynamic: false, value: '' })] },
        },
        sibling,
      ],
    };
    const plan = { id: 'checkout', _class: 'Plan', root };
    fixture = TestBed.createComponent(PlanEditorBaseComponent);
    fixture.componentRef.setInput('initialPlanContext', { id: plan.id, entityType: 'plans', entity: plan, plan });
    settle();
    selectNode(FOLLOWING_SIBLING);
    return textbox();
  }

  function focusWithCaret(input: HTMLInputElement, caret = input.value.length): void {
    input.setSelectionRange(caret, caret);
    input.focus();
    settle();
  }

  function type(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    settle();
  }

  function press(input: HTMLInputElement, key: string): void {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }));
    settle();
  }

  function plainPanel(input: HTMLInputElement): HTMLElement {
    const panel = describedPanel(input, PLAIN_HELP);
    expect(panel).toBeDefined();
    return panel!;
  }

  function productOption(input: HTMLInputElement): HTMLElement {
    const option = visibleText(plainPanel(input), PREVIOUS_PRODUCT);
    expect(option).toBeDefined();
    return option!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanEditorBaseComponent, PlanCommonTreeEditorFormComponent, EchoComponent],
      imports: [DRAG_DROP_EXPORTS, DynamicFormsModule, FormsModule, PlanTreeComponent, StandaloneFieldsComponent],
      providers: [
        provideTestStepApi(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: LOCAL_STORAGE, useValue: localStorage },
        { provide: SCREEN_WIDTH, useValue: of(1280) },
        { provide: AuthService, useValue: { hasRight: () => true } },
        { provide: FunctionActionsService, useValue: {} },
        { provide: PlansService, useValue: { getArtefactTypes: () => of(['Sequence', 'Echo', 'Set', 'CallKeyword']) } },
        { provide: AugmentedPlansService, useValue: { getArtefactTemplates: () => of(['Sequence']) } },
        { provide: AugmentedScreenService, useValue: { getDefaultParametersByScreenId: () => of({}) } },
        {
          provide: PlanContextApiService,
          useValue: {
            createContextDuplicate: (context: PlanContext): PlanContext => JSON.parse(JSON.stringify(context)),
            createRepositoryObjectReference: (): undefined => undefined,
            savePlan: (context: PlanContext) => of(context),
          },
        },
      ],
    })
      .overrideComponent(PlanEditorBaseComponent, {
        set: {
          template: `
            <section stepDragDropGroupContainer stepDropAreaId="planTree">
              <step-plan-common-tree-editor-form />
            </section>
          `,
        },
      })
      .compileComponents();

    const registry = TestBed.inject(ArtefactService);
    registry.register('Sequence', { icon: 'list' });
    registry.register('Set', { icon: 'list' });
    registry.register('CallKeyword', { icon: 'list' });
    registry.register('Echo', { icon: 'list', component: EchoComponent });
  });

  afterEach(() => fixture?.destroy());

  it('AC-1: focusing editable plan text opens a suggestion above the existing help', fakeAsync(() => {
    const input = openPlan();
    expect(describedPanel(input, PLAIN_HELP)).toBeUndefined();

    focusWithCaret(input);

    const panel = plainPanel(input);
    const option = productOption(input);
    const help = Array.from(panel.querySelectorAll('p')).find((paragraph) =>
      normalize(paragraph.textContent).includes(PLAIN_HELP),
    );
    expect(help).toBeDefined();
    expect(option.compareDocumentPosition(help!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(visibleText(panel, 'Learn more')).toBeDefined();
  }));

  it.each([
    { mode: 'Groovy', value: { dynamic: true, expression: 'prev' }, help: GROOVY_HELP },
    { mode: 'plain text', value: { dynamic: false, value: 'prev' }, help: PLAIN_HELP },
  ])('AC-1: $mode keeps its existing expanded editor help without suggestions', ({ mode, value, help }) =>
    fakeAsync(() => {
      const input = openPlan(value);
      focusWithCaret(input);
      if (mode === 'Groovy') {
        const expressionPanel = describedPanel(input, GROOVY_HELP);
        expect(expressionPanel).toBeDefined();
        expect(shownExpressions(expressionPanel!)).toEqual([]);
      }

      const editor: HTMLElement = fixture.nativeElement;
      const editButton = Array.from(editor.querySelectorAll('button')).find((button) =>
        (button.getAttribute('aria-describedby') ?? '').split(/\s+/).some((id) => {
          const description = document.getElementById(id);
          return !!description && normalize(description.textContent) === 'Open texteditor';
        }),
      );
      expect(editButton).toBeDefined();
      editButton!.focus();
      editButton!.click();
      settle();

      const dialog = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find((element) =>
        normalize(element.textContent).includes('Free text editor'),
      );
      expect(dialog).toBeDefined();
      expect(normalize(dialog!.textContent)).toContain(help);
      expect(shownExpressions(dialog!)).toEqual([]);
      visibleText(dialog!, 'Cancel')!.click();
      settle();
    })(),
  );

  it('AC-2: the keyword scope and following sibling offer different expressions and prev filters the list', fakeAsync(() => {
    const input = openPlan();
    focusWithCaret(input);
    const unfiltered = shownExpressions(plainPanel(input));

    type(input, 'prev');
    const filtered = shownExpressions(plainPanel(input));

    selectNode(KEYWORD_SCOPE);
    const keywordInput = textbox();
    focusWithCaret(keywordInput);
    const keywordExpressions = shownExpressions(plainPanel(keywordInput));

    expect({ unfiltered, filtered, keywordExpressions }).toEqual({
      unfiltered: [PREVIOUS_PRODUCT, PLAN_VARIABLE],
      filtered: [PREVIOUS_PRODUCT],
      keywordExpressions: expect.arrayContaining([KEYWORD_PRODUCT]),
    });
    expect(keywordExpressions).not.toContain(PREVIOUS_PRODUCT);
  }));

  it('AC-3: the suggestion displays the expression and its return type together', fakeAsync(() => {
    const input = openPlan();
    focusWithCaret(input);
    const option = productOption(input);
    const text = normalize(
      option.closest('button, [role="option"], [role="menuitem"]')?.textContent ?? option.parentElement!.textContent,
    );
    expect(text).toContain(PREVIOUS_PRODUCT);
    expect(text).toMatch(/\b(?:string|boolean)\b/i);
  }));

  it('AC-4 and AC-6: clicking a suggestion replaces the word and leaves the caret after the placeholder', fakeAsync(() => {
    const input = openPlan({ dynamic: false, value: 'Order prev ready' });
    focusWithCaret(input, 'Order prev'.length);

    productOption(input).click();
    settle();

    expect(input.value).toBe('Order ${previous.first_product_id} ready');
    expect(sibling.text).toMatchObject({ dynamic: false, value: 'Order ${previous.first_product_id} ready' });
    const afterBrace = 'Order ${previous.first_product_id}'.length;
    expect(input.selectionStart).toBe(afterBrace);
    expect(input.selectionEnd).toBe(afterBrace);
  }));

  it.each(['', '}'])('AC-5: replaces the placeholder with closing text %j and preserves its neighbors', (closing) =>
    fakeAsync(() => {
      const beforeCaret = 'Start ${myVar} order ${prev';
      const input = openPlan({ dynamic: false, value: `${beforeCaret}${closing} ready for \${host}` });
      focusWithCaret(input, beforeCaret.length);

      productOption(input).click();
      settle();

      const expected = 'Start ${myVar} order ${previous.first_product_id} ready for ${host}';
      expect(input.value).toBe(expected);
      expect(sibling.text).toMatchObject({ dynamic: false, value: expected });
    })(),
  );

  it('AC-6: Arrow Down and Enter select a matching suggestion', fakeAsync(() => {
    const input = openPlan();
    focusWithCaret(input);
    type(input, 'prev');
    productOption(input);

    press(input, 'ArrowDown');
    press(input, 'Enter');

    expect(input.value).toBe('${previous.first_product_id}');
    expect(sibling.text).toMatchObject({ dynamic: false, value: '${previous.first_product_id}' });
  }));

  it('AC-6: Escape dismisses suggestions without changing the field', fakeAsync(() => {
    const input = openPlan({ dynamic: false, value: 'prev' });
    focusWithCaret(input);
    const wasOffered = !!visibleText(plainPanel(input), PREVIOUS_PRODUCT);

    press(input, 'Escape');

    expect(describedPanel(input, PLAIN_HELP)).toBeUndefined();
    expect(input.value).toBe('prev');
    expect(sibling.text).toMatchObject({ dynamic: false, value: 'prev' });
    expect(wasOffered).toBe(true);
  }));

  it('AC-6: typing a non-matching value keeps the existing help and bound editing available', fakeAsync(() => {
    const input = openPlan();
    focusWithCaret(input);
    const wasOffered = !!visibleText(plainPanel(input), PREVIOUS_PRODUCT);

    type(input, 'unmatchedExpression');

    const panel = plainPanel(input);
    expect(shownExpressions(panel)).toEqual([]);
    expect(visibleText(panel, 'Learn more')).toBeDefined();
    expect(sibling.text).toMatchObject({ dynamic: false, value: 'unmatchedExpression' });
    expect(wasOffered).toBe(true);
  }));

  it('AC-1 and AC-6: number and password keep their current behavior and contextless text still edits with help', fakeAsync(() => {
    const standalone = TestBed.createComponent(StandaloneFieldsComponent);
    standalone.detectChanges();
    tick();
    standalone.detectChanges();
    tick();
    standalone.detectChanges();

    const fields: HTMLElement = standalone.nativeElement.querySelector('[data-testid="standalone-field"]');
    const number = fields.querySelector<HTMLInputElement>('input[type="number"]')!;
    const password = fields.querySelector<HTMLInputElement>('input[type="password"]')!;
    const input = fields.querySelector<HTMLInputElement>('input[type="text"]')!;
    number.focus();
    expect(number.value).toBe('2');
    expect(number.getAttribute('aria-describedby')).toBeNull();
    password.focus();
    expect(password.value).toBe('secret');
    expect(password.getAttribute('aria-describedby')).toBeNull();

    input.focus();
    input.value = 'prev';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    standalone.detectChanges();
    tick(500);
    standalone.detectChanges();

    const help = plainPanel(input);
    expect(visibleText(help, 'Learn more')).toBeDefined();
    expect(shownExpressions(help)).toEqual([]);
    input.blur();
    input.focus();
    expect(input.value).toBe('prev');
    standalone.destroy();
  }));
});
