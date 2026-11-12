import { Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DynamicFormsModule, provideTestStepApi } from '@exense/step-core';

type FieldKind = 'textfield' | 'checkbox' | 'json' | 'resource' | 'time';
type FieldValue = { dynamic?: boolean; value?: unknown; expression?: string };
type RenderOptions = Partial<{ isNumber: boolean; isPassword: boolean; disabled: boolean }>;

const LEARN_MORE_URL =
  'https://step.dev/knowledgebase/userdocs/plans/plans-variables/#embedding-variables-in-text-values';

const EXPRESSION_HELP =
  'The whole field is a Groovy expression, for example "http://" + host + ":8080/api". Use it when you need a number, a boolean or a complex object rather than text, or logic the placeholder syntax cannot express.';

const PLAIN_HELP_LINES = [
  'Plain (non dynamic) plan values can now embed variables using the ${...} placeholder syntax. A value containing ${ was previously used literally and is now evaluated, so existing values have to be escaped to keep their meaning.',
  'This is done for you, in two different ways depending on where the value lives. Only the values containing ${ are ever rewritten: a value without it, including one containing $ or $$, is never touched.',
];

const TOGGLE_TO_EXPRESSION_TOOLTIP = 'Use a dynamic expression to set this attribute';
const TOGGLE_TO_CONSTANT_TOOLTIP = 'Use a constant value to set this attribute';

const PLAIN_VALUES: Record<FieldKind, FieldValue> = {
  textfield: { dynamic: false, value: 'plain' },
  checkbox: { dynamic: false, value: false },
  json: { dynamic: false, value: '{}' },
  resource: { dynamic: false, value: '' },
  time: { dynamic: false, value: 1000 },
};

const EXPRESSION_VALUE: FieldValue = { dynamic: true, expression: 'host' };

const ALL_KINDS: FieldKind[] = ['textfield', 'checkbox', 'json', 'resource', 'time'];

@Component({
  imports: [FormsModule, DynamicFormsModule],
  template: `
    <div data-testid="field">
      @switch (kind()) {
        @case ('textfield') {
          <step-dynamic-textfield
            label="Field"
            [isNumber]="isNumber()"
            [isPassword]="isPassword()"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
            [disabled]="disabled()"
          />
        }
        @case ('checkbox') {
          <step-dynamic-checkbox
            label="Field"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
            [disabled]="disabled()"
          />
        }
        @case ('json') {
          <step-dynamic-json
            label="Field"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
            [disabled]="disabled()"
          />
        }
        @case ('resource') {
          <step-dynamic-resource
            label="Field"
            type="functions"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
            [disabled]="disabled()"
          />
        }
        @case ('time') {
          <step-dynamic-time-input
            label="Field"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
            [disabled]="disabled()"
          />
        }
      }
    </div>
    <input type="text" aria-label="Other field" data-testid="other-field" />
  `,
})
class HostComponent {
  /* eslint-disable step-lint/component-public-fields -- the test drives and reads this host state from outside the component. */
  readonly kind = signal<FieldKind>('textfield');
  readonly isNumber = signal(false);
  readonly isPassword = signal(false);
  readonly disabled = signal(false);
  readonly model = signal<FieldValue>(PLAIN_VALUES.textfield);
  /* eslint-enable step-lint/component-public-fields */
}

describe('Dynamic forms help dropdown', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  // NgModel applies the disabled state in microtasks that can be chained through nested fields.
  const settle = (): void => {
    for (let i = 0; i < 3; i++) {
      fixture.detectChanges();
      tick(500);
    }
    fixture.detectChanges();
  };

  const render = (kind: FieldKind, value: FieldValue, options: RenderOptions = {}): void => {
    host.kind.set(kind);
    host.isNumber.set(!!options.isNumber);
    host.isPassword.set(!!options.isPassword);
    host.disabled.set(!!options.disabled);
    host.model.set(value);
    settle();
  };

  const field = (): HTMLElement => fixture.nativeElement.querySelector('[data-testid="field"]');
  const otherField = (): HTMLInputElement => fixture.nativeElement.querySelector('[data-testid="other-field"]');

  const inputOfType = (type: string): HTMLInputElement => {
    const input = Array.from(field().querySelectorAll('input')).find((item) => item.type === type);
    if (!input) {
      throw new Error(`No input of type "${type}" is rendered in the field`);
    }
    return input;
  };
  const textbox = (): HTMLInputElement => inputOfType('text');

  // The tooltip text is the accessible description of the toggle button.
  const buttonByTooltip = (tooltip: string): HTMLButtonElement => {
    const button = Array.from(field().querySelectorAll('button')).find((item) =>
      (item.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter((id) => !!id)
        .some((id) => document.getElementById(id)?.textContent?.trim() === tooltip),
    );
    if (!button) {
      throw new Error(`No button with tooltip "${tooltip}" is rendered in the field`);
    }
    return button;
  };

  const focusInput = (input: HTMLInputElement): void => {
    input.focus();
    settle();
  };

  const toggleWithButton = (tooltip: string): void => {
    const button = buttonByTooltip(tooltip);
    // A real click on a button moves the focus to this button.
    button.focus();
    button.click();
    settle();
  };

  const normalize = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim();
  const pageText = (): string => normalize(document.body.textContent);

  const learnMoreLinks = (): HTMLAnchorElement[] =>
    Array.from(document.body.querySelectorAll('a')).filter((link) => normalize(link.textContent) === 'Learn more');

  const expectNoHelp = (): void => {
    expect(learnMoreLinks()).toHaveLength(0);
    expect(pageText()).not.toContain('Groovy expression');
    expect(pageText()).not.toContain('placeholder syntax');
    expect(pageText()).not.toContain('Plain (non dynamic) plan values');
  };

  const expectLearnMoreLink = (): void => {
    const links = learnMoreLinks();
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(LEARN_MORE_URL);
    expect(links[0].getAttribute('target')).toBe('_blank');
  };

  const expectExpressionHelp = (): void => {
    expect(pageText()).toContain(normalize(EXPRESSION_HELP));
    expectLearnMoreLink();
  };

  const expectPlainHelp = (): void => {
    PLAIN_HELP_LINES.forEach((line) => expect(pageText()).toContain(normalize(line)));
    expect(pageText()).not.toContain('Groovy expression');
    expectLearnMoreLink();
  };

  const expectHelp = (mode: 'expression' | 'plain'): void =>
    mode === 'expression' ? expectExpressionHelp() : expectPlainHelp();

  const type = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    settle();
  };

  const pressEscape = (input: HTMLInputElement): void => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    settle();
  };

  // Simulates what a browser does when the user clicks into another field.
  const clickIntoOtherField = (): void => {
    const target = otherField();
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    target.focus();
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    target.click();
    settle();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTestStepApi()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('AC-1: plain text textfield shows the plain-value help on focus', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield);
    expectNoHelp();

    focusInput(textbox());

    expect(document.activeElement).toBe(textbox());
    expectPlainHelp();
  }));

  it.each([
    ['number', { isNumber: true }, 'number'],
    ['password', { isPassword: true }, 'password'],
  ])('AC-2: %s textfield in plain mode shows no help on focus', (_name, options, inputType) =>
    fakeAsync(() => {
      render('textfield', PLAIN_VALUES.textfield, options);

      focusInput(inputOfType(inputType));

      expect(document.activeElement).toBe(inputOfType(inputType));
      expectNoHelp();
    })(),
  );

  it.each(ALL_KINDS)('AC-3: %s in expression mode shows the expression help on focus', (kind) =>
    fakeAsync(() => {
      render(kind, EXPRESSION_VALUE);
      expectNoHelp();

      focusInput(textbox());

      expect(document.activeElement).toBe(textbox());
      expectExpressionHelp();
    })(),
  );

  it.each(ALL_KINDS)(
    'AC-4: %s toggled to expression mode shows no help until the expression input is focused',
    (kind) =>
      fakeAsync(() => {
        render(kind, PLAIN_VALUES[kind]);

        toggleWithButton(TOGGLE_TO_EXPRESSION_TOOLTIP);

        expect(host.model().dynamic).toBe(true);
        expect(document.activeElement).not.toBe(textbox());
        expectNoHelp();

        focusInput(textbox());

        expectExpressionHelp();
      })(),
  );

  it.each(['expression', 'plain'] as const)(
    'AC-5: clicking into another field closes the %s help and that field is focused by the first click',
    (mode) =>
      fakeAsync(() => {
        render('textfield', mode === 'expression' ? EXPRESSION_VALUE : PLAIN_VALUES.textfield);
        focusInput(textbox());
        expectHelp(mode);

        clickIntoOtherField();

        expect(document.activeElement).toBe(otherField());
        expectNoHelp();
        // A backdrop would swallow the first click outside of the field.
        expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
      })(),
  );

  it('AC-5: tabbing into another field closes the help', fakeAsync(() => {
    render('textfield', EXPRESSION_VALUE);
    focusInput(textbox());
    expectExpressionHelp();

    otherField().focus();
    settle();

    expect(document.activeElement).toBe(otherField());
    expectNoHelp();
  }));

  it.each(['expression', 'plain'] as const)(
    'AC-6: Esc closes the %s help, keeps the focus and the next focus opens it again',
    (mode) =>
      fakeAsync(() => {
        render('textfield', mode === 'expression' ? EXPRESSION_VALUE : PLAIN_VALUES.textfield);
        focusInput(textbox());
        expectHelp(mode);

        pressEscape(textbox());

        expect(document.activeElement).toBe(textbox());
        expectNoHelp();

        otherField().focus();
        settle();
        expectNoHelp();

        focusInput(textbox());

        expectHelp(mode);
      })(),
  );

  it.each(['expression', 'plain'] as const)(
    'AC-7: typing in %s mode updates the model and keeps the help open',
    (mode) =>
      fakeAsync(() => {
        render('textfield', mode === 'expression' ? EXPRESSION_VALUE : PLAIN_VALUES.textfield);
        focusInput(textbox());
        expectHelp(mode);

        type(textbox(), 'typed value');

        expect(mode === 'expression' ? host.model().expression : host.model().value).toBe('typed value');
        expect(document.activeElement).toBe(textbox());
        expectHelp(mode);
      })(),
  );

  it.each(ALL_KINDS)('AC-8: toggling %s back to plain mode closes the expression help', (kind) =>
    fakeAsync(() => {
      render(kind, EXPRESSION_VALUE);
      focusInput(textbox());
      expectExpressionHelp();

      buttonByTooltip(TOGGLE_TO_CONSTANT_TOOLTIP).click();
      settle();

      expect(host.model().dynamic).toBe(false);
      expectNoHelp();
    })(),
  );

  it('AC-9: disabled textfield in plain mode shows no help', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield, { disabled: true });

    expect(textbox().disabled).toBe(true);
    focusInput(textbox());
    textbox().click();
    settle();

    expectNoHelp();
  }));

  it.each(ALL_KINDS)('AC-9: disabled %s in expression mode shows no help', (kind) =>
    fakeAsync(() => {
      render(kind, EXPRESSION_VALUE, { disabled: true });

      expect(textbox().disabled).toBe(true);
      focusInput(textbox());
      textbox().click();
      settle();

      expectNoHelp();
    })(),
  );
});
