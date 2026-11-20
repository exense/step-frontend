import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DYNAMIC_EXPRESSION_HELP, DynamicFormsModule, PLAIN_VALUE_HELP, provideTestStepApi } from '@exense/step-core';

type FieldValue = { dynamic?: boolean; value?: unknown; expression?: string };
type RenderOptions = Partial<{ isPassword: boolean }>;
type HelpValue = { html: string; learnMoreUrl: string };

const LEARN_MORE_URL =
  'https://step.dev/knowledgebase/userdocs/plans/plans-variables/#embedding-variables-in-text-values';

const EXPRESSION_HELP =
  'The whole field is a Groovy expression, for example "http://" + host + ":8080/api". Use it when you need a number, a boolean or a complex object rather than text, or logic the placeholder syntax cannot express.';

const PLAIN_HELP_LINES = [
  'Plain (non dynamic) plan values can now embed variables using the ${...} placeholder syntax. A value containing ${ was previously used literally and is now evaluated, so existing values have to be escaped to keep their meaning.',
  'This is done for you, in two different ways depending on where the value lives. Only the values containing ${ are ever rewritten: a value without it, including one containing $ or $$, is never touched.',
];

const CUSTOM_EXPRESSION_HELP: HelpValue = {
  html: '<p>Custom expression help with <strong>markup</strong>.</p>',
  learnMoreUrl: 'https://example.test/custom-expression-help',
};
const CUSTOM_PLAIN_HELP: HelpValue = {
  html: '<p>Custom plain help, first paragraph.</p><p>Custom plain help, second paragraph.</p>',
  learnMoreUrl: 'https://example.test/custom-plain-help',
};

const EDIT_TOOLTIP = 'Open texteditor';
const DIALOG_TITLE = 'Free text editor';

const PLAIN_VALUE: FieldValue = { dynamic: false, value: 'plain' };
const EXPRESSION_VALUE: FieldValue = { dynamic: true, expression: 'host' };

@Component({
  imports: [FormsModule, DynamicFormsModule],
  template: `
    <div data-testid="field">
      <step-dynamic-textfield
        label="Field"
        [isPassword]="isPassword()"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />
    </div>
  `,
})
class HostComponent {
  /* eslint-disable step-lint/component-public-fields -- the test drives and reads this host state from outside the component. */
  readonly isPassword = signal(false);
  readonly model = signal<FieldValue>(PLAIN_VALUE);
  /* eslint-enable step-lint/component-public-fields */
}

describe('Dynamic forms help texts from injection tokens', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const settle = (): void => {
    for (let i = 0; i < 3; i++) {
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      tick(500);
    }
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  };

  const normalize = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim();

  const createFixture = (providers: unknown[] = []): void => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTestStepApi(), ...(providers as never[])],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  };

  const render = (value: FieldValue, options: RenderOptions = {}): void => {
    host.isPassword.set(!!options.isPassword);
    host.model.set(value);
    settle();
  };

  const field = (): HTMLElement => fixture.nativeElement.querySelector('[data-testid="field"]');
  const textbox = (): HTMLInputElement => field().querySelector('input[type="text"]') as HTMLInputElement;

  // The tooltip text is the accessible description of the button.
  const editButton = (): HTMLButtonElement => {
    const button = Array.from(field().querySelectorAll('button')).find((item) =>
      (item.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter((id) => !!id)
        .some((id) => document.getElementById(id)?.textContent?.trim() === EDIT_TOOLTIP),
    );
    if (!button) {
      throw new Error(`No button with tooltip "${EDIT_TOOLTIP}" is rendered in the field`);
    }
    return button;
  };

  const learnMoreLinks = (root: ParentNode): HTMLAnchorElement[] =>
    Array.from(root.querySelectorAll('a')).filter((link) => normalize(link.textContent) === 'Learn more');

  const editorDialog = (): HTMLElement => {
    const dialog = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find((item) =>
      normalize(item.textContent).includes(DIALOG_TITLE),
    );
    if (!dialog) {
      throw new Error(`The "${DIALOG_TITLE}" dialog is not open`);
    }
    return dialog;
  };

  const openEditorDialog = (): HTMLElement => {
    const button = editButton();
    button.focus();
    button.click();
    settle();
    return editorDialog();
  };

  const expectHelp = (root: HTMLElement, expectedParagraphs: string[], expectedUrl: string): void => {
    const text = normalize(root.textContent);
    expectedParagraphs.forEach((paragraph) => expect(text).toContain(normalize(paragraph)));
    const links = learnMoreLinks(root);
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(expectedUrl);
    expect(links[0].getAttribute('target')).toBe('_blank');
  };

  const expectNoDefaultHelp = (root: HTMLElement): void => {
    const text = normalize(root.textContent);
    expect(text).not.toContain('Groovy expression');
    expect(text).not.toContain('Plain (non dynamic) plan values');
    expect(learnMoreLinks(root).some((link) => link.getAttribute('href') === LEARN_MORE_URL)).toBe(false);
  };

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container > *').forEach((item) => item.remove());
  });

  it('AC-15: the root-provided defaults hold the specified message texts and link', () => {
    createFixture();

    const expressionHelp = TestBed.inject(DYNAMIC_EXPRESSION_HELP);
    const plainHelp = TestBed.inject(PLAIN_VALUE_HELP);

    expect(expressionHelp.learnMoreUrl).toBe(LEARN_MORE_URL);
    expect(plainHelp.learnMoreUrl).toBe(LEARN_MORE_URL);

    const parseHtml = (html: string): HTMLDivElement => {
      const container = document.createElement('div');
      container.innerHTML = html;
      return container;
    };
    const expressionContent = parseHtml(expressionHelp.html);
    const plainContent = parseHtml(plainHelp.html);

    // The message markup contains no link, the link is rendered separately from learnMoreUrl.
    expect(expressionContent.querySelector('a')).toBeNull();
    expect(plainContent.querySelector('a')).toBeNull();
    expect(normalize(expressionContent.textContent)).toBe(normalize(EXPRESSION_HELP));
    const plainParagraphs = Array.from(plainContent.querySelectorAll('p')).map((item) => normalize(item.textContent));
    expect(plainParagraphs).toEqual(PLAIN_HELP_LINES.map(normalize));
  });

  it('AC-15: without overrides the field dropdown and the editor dialog show the default texts', fakeAsync(() => {
    createFixture();
    render(EXPRESSION_VALUE);

    textbox().focus();
    settle();
    expectHelp(document.body, [EXPRESSION_HELP], LEARN_MORE_URL);

    textbox().blur();
    settle();
    expectHelp(openEditorDialog(), [EXPRESSION_HELP], LEARN_MORE_URL);
  }));

  it('AC-15: a provided DYNAMIC_EXPRESSION_HELP value is shown in the field dropdown and in the editor dialog', fakeAsync(() => {
    createFixture([{ provide: DYNAMIC_EXPRESSION_HELP, useValue: CUSTOM_EXPRESSION_HELP }]);
    render(EXPRESSION_VALUE);

    textbox().focus();
    settle();

    expectHelp(document.body, ['Custom expression help with markup.'], CUSTOM_EXPRESSION_HELP.learnMoreUrl);
    expectNoDefaultHelp(document.body);
    // The html is rendered as markup, not as escaped text.
    expect(normalize(document.body.querySelector('strong')?.textContent)).toBe('markup');
    expect(normalize(document.body.textContent)).not.toContain('<strong>');

    textbox().blur();
    settle();
    const dialog = openEditorDialog();

    expectHelp(dialog, ['Custom expression help with markup.'], CUSTOM_EXPRESSION_HELP.learnMoreUrl);
    expectNoDefaultHelp(dialog);
    expect(normalize(dialog.querySelector('strong')?.textContent)).toBe('markup');
  }));

  it('AC-15: a provided PLAIN_VALUE_HELP value is shown in the field dropdown and in the editor dialog', fakeAsync(() => {
    createFixture([{ provide: PLAIN_VALUE_HELP, useValue: CUSTOM_PLAIN_HELP }]);
    render(PLAIN_VALUE);
    const paragraphs = ['Custom plain help, first paragraph.', 'Custom plain help, second paragraph.'];

    textbox().focus();
    settle();

    expectHelp(document.body, paragraphs, CUSTOM_PLAIN_HELP.learnMoreUrl);
    expectNoDefaultHelp(document.body);

    textbox().blur();
    settle();
    const dialog = openEditorDialog();

    expectHelp(dialog, paragraphs, CUSTOM_PLAIN_HELP.learnMoreUrl);
    expectNoDefaultHelp(dialog);
  }));

  it('AC-15: a provided PLAIN_VALUE_HELP value is not shown for password fields and does not leak into expression help', fakeAsync(() => {
    createFixture([
      { provide: PLAIN_VALUE_HELP, useValue: CUSTOM_PLAIN_HELP },
      { provide: DYNAMIC_EXPRESSION_HELP, useValue: CUSTOM_EXPRESSION_HELP },
    ]);
    render(PLAIN_VALUE, { isPassword: true });

    const dialog = openEditorDialog();

    expect(normalize(dialog.textContent)).not.toContain('Custom plain help');
    expect(normalize(dialog.textContent)).not.toContain('Custom expression help');
    expect(learnMoreLinks(dialog)).toHaveLength(0);

    Array.from(dialog.querySelectorAll('button'))
      .find((item) => normalize(item.textContent) === 'Cancel')
      ?.click();
    settle();
    host.isPassword.set(false);
    host.model.set(EXPRESSION_VALUE);
    settle();
    textbox().focus();
    settle();

    expectHelp(document.body, ['Custom expression help with markup.'], CUSTOM_EXPRESSION_HELP.learnMoreUrl);
    expect(normalize(document.body.textContent)).not.toContain('Custom plain help');
  }));
});
