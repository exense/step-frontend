import { ApplicationRef, Component, inject, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DynamicFormsModule, provideTestStepApi, RichEditorDialogService } from '@exense/step-core';

type FieldKind = 'textfield' | 'checkbox' | 'json' | 'resource' | 'time';
type FieldValue = { dynamic?: boolean; value?: unknown; expression?: string };
type RenderOptions = Partial<{ isNumber: boolean; isPassword: boolean }>;

const LEARN_MORE_URL =
  'https://step.dev/knowledgebase/userdocs/plans/plans-variables/#embedding-variables-in-text-values';

const EXPRESSION_HELP =
  'The whole field is a Groovy expression, for example "http://" + host + ":8080/api". Use it when you need a number, a boolean or a complex object rather than text, or logic the placeholder syntax cannot express.';

const PLAIN_HELP_LINES = [
  'Plain (non dynamic) plan values can now embed variables using the ${...} placeholder syntax. A value containing ${ was previously used literally and is now evaluated, so existing values have to be escaped to keep their meaning.',
  'This is done for you, in two different ways depending on where the value lives. Only the values containing ${ are ever rewritten: a value without it, including one containing $ or $$, is never touched.',
];

const EDIT_TOOLTIP = 'Open texteditor';
const DIALOG_TITLE = 'Free text editor';
const UNSAVED_CHANGES_WARNING = 'You have unsaved changed. Do you want to close the dialog?';

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
          />
        }
        @case ('checkbox') {
          <step-dynamic-checkbox label="Field" [ngModel]="model()" (ngModelChange)="model.set($event)" />
        }
        @case ('json') {
          <step-dynamic-json label="Field" [ngModel]="model()" (ngModelChange)="model.set($event)" />
        }
        @case ('resource') {
          <step-dynamic-resource
            label="Field"
            type="functions"
            [ngModel]="model()"
            (ngModelChange)="model.set($event)"
          />
        }
        @case ('time') {
          <step-dynamic-time-input label="Field" [ngModel]="model()" (ngModelChange)="model.set($event)" />
        }
      }
    </div>
    <button type="button" data-testid="open-without-help" (click)="openWithoutHelp()">Open without help</button>
  `,
})
class HostComponent {
  private _richEditorDialogs = inject(RichEditorDialogService);

  /* eslint-disable step-lint/component-public-fields -- the test drives and reads this host state from outside the component. */
  readonly kind = signal<FieldKind>('textfield');
  readonly isNumber = signal(false);
  readonly isPassword = signal(false);
  readonly model = signal<FieldValue>(PLAIN_VALUES.textfield);
  readonly savedWithoutHelp = signal<string | undefined>(undefined);
  /* eslint-enable step-lint/component-public-fields */

  protected openWithoutHelp(): void {
    this._richEditorDialogs.editText('opened without help').subscribe((text) => this.savedWithoutHelp.set(text));
  }
}

describe('Dynamic forms help in the free text editor dialog', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  // Dialogs are rendered outside of the host fixture, so the application has to be ticked as well.
  const settle = (): void => {
    for (let i = 0; i < 3; i++) {
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      tick(500);
    }
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  };

  const render = (kind: FieldKind, value: FieldValue, options: RenderOptions = {}): void => {
    host.kind.set(kind);
    host.isNumber.set(!!options.isNumber);
    host.isPassword.set(!!options.isPassword);
    host.model.set(value);
    settle();
  };

  const normalize = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim();

  const field = (): HTMLElement => fixture.nativeElement.querySelector('[data-testid="field"]');

  // The tooltip text is the accessible description of the button.
  const buttonByTooltip = (tooltip: string): HTMLButtonElement | undefined =>
    Array.from(field().querySelectorAll('button')).find((item) =>
      (item.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter((id) => !!id)
        .some((id) => document.getElementById(id)?.textContent?.trim() === tooltip),
    );

  const clickEditButton = (): void => {
    const button = buttonByTooltip(EDIT_TOOLTIP);
    if (!button) {
      throw new Error(`No button with tooltip "${EDIT_TOOLTIP}" is rendered in the field`);
    }
    // A real click on a button moves the focus to this button.
    button.focus();
    button.click();
    settle();
  };

  const clickDocumentButton = (name: string): void => {
    const button = Array.from(document.querySelectorAll('button')).find((item) => normalize(item.textContent) === name);
    if (!button) {
      throw new Error(`No button "${name}" is rendered in the document`);
    }
    button.click();
    settle();
  };

  const openDialogs = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));

  const editorDialog = (): HTMLElement => {
    const dialog = openDialogs().find((item) => normalize(item.textContent).includes(DIALOG_TITLE));
    if (!dialog) {
      throw new Error(`The "${DIALOG_TITLE}" dialog is not open`);
    }
    return dialog;
  };

  const editorDialogIsOpen = (): boolean =>
    openDialogs().some((item) => normalize(item.textContent).includes(DIALOG_TITLE));

  const dialogText = (): string => normalize(editorDialog().textContent);

  const learnMoreLinksInDialog = (): HTMLAnchorElement[] =>
    Array.from(editorDialog().querySelectorAll('a')).filter((link) => normalize(link.textContent) === 'Learn more');

  // The editor text area of the dialog is the textbox of the dialog.
  const editorTextbox = (): HTMLTextAreaElement => {
    const textbox = editorDialog().querySelector<HTMLTextAreaElement>('textarea');
    if (!textbox) {
      throw new Error('The editor of the dialog has no text input');
    }
    return textbox;
  };

  const dialogButton = (name: string): HTMLButtonElement => {
    const button = Array.from(editorDialog().querySelectorAll('button')).find(
      (item) => normalize(item.textContent) === name,
    );
    if (!button) {
      throw new Error(`No button "${name}" is rendered in the dialog`);
    }
    return button;
  };

  // The help block is a static block under the editor body and above the dialog buttons.
  const expectLearnMoreLinkUnderEditor = (expectedUrl: string = LEARN_MORE_URL): void => {
    const links = learnMoreLinksInDialog();
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(expectedUrl);
    expect(links[0].getAttribute('target')).toBe('_blank');

    const following = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(editorTextbox().compareDocumentPosition(links[0]) & following).toBeTruthy();
    expect(links[0].compareDocumentPosition(dialogButton('Save')) & following).toBeTruthy();
    expect(links[0].compareDocumentPosition(dialogButton('Cancel')) & following).toBeTruthy();
  };

  const expectDialogWithExpressionHelp = (): void => {
    expect(dialogText()).toContain(normalize(EXPRESSION_HELP));
    expect(dialogText()).not.toContain('Plain (non dynamic) plan values');
    expectLearnMoreLinkUnderEditor();
  };

  const expectDialogWithPlainHelp = (): void => {
    PLAIN_HELP_LINES.forEach((line) => expect(dialogText()).toContain(normalize(line)));
    expect(dialogText()).not.toContain('Groovy expression');
    expectLearnMoreLinkUnderEditor();
  };

  const expectDialogWithoutHelp = (): void => {
    expect(dialogText()).toContain(DIALOG_TITLE);
    expect(dialogText()).not.toContain('Groovy expression');
    expect(dialogText()).not.toContain('placeholder syntax');
    expect(dialogText()).not.toContain('Plain (non dynamic) plan values');
    expect(learnMoreLinksInDialog()).toHaveLength(0);
    expect(editorDialog().querySelector('a')).toBeNull();
    // The dialog is still the usual editor with its buttons.
    expect(dialogButton('Save')).toBeTruthy();
    expect(dialogButton('Cancel')).toBeTruthy();
  };

  const typeIntoEditor = (text: string): void => {
    const textbox = editorTextbox();
    textbox.focus();
    textbox.value = text;
    textbox.dispatchEvent(new Event('input', { bubbles: true }));
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
    document.querySelectorAll('.cdk-overlay-container > *').forEach((item) => item.remove());
  });

  it.each(ALL_KINDS)('AC-11: %s in expression mode opens the editor dialog with the expression help', (kind) =>
    fakeAsync(() => {
      render(kind, EXPRESSION_VALUE);

      clickEditButton();

      expect(dialogText()).toContain(DIALOG_TITLE);
      expectDialogWithExpressionHelp();
    })(),
  );

  it('AC-12: plain text textfield opens the editor dialog with both paragraphs of the plain-value help', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield);

    clickEditButton();

    expect(dialogText()).toContain(DIALOG_TITLE);
    expectDialogWithPlainHelp();
    // The placeholder syntax is shown literally, as text.
    expect(dialogText()).toContain('${...}');
    expect(
      Array.from(editorDialog().querySelectorAll('p')).filter((item) => normalize(item.textContent).length > 0),
    ).toHaveLength(2);
  }));

  it('AC-13: password textfield in plain mode opens the editor dialog without help', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield, { isPassword: true });

    clickEditButton();

    expectDialogWithoutHelp();
  }));

  it('AC-13: number textfield in plain mode has no edit button', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield, { isNumber: true });

    expect(buttonByTooltip(EDIT_TOOLTIP)).toBeUndefined();
  }));

  it('AC-13: editText called without the help parameter opens the dialog without a help block', fakeAsync(() => {
    render('textfield', PLAIN_VALUES.textfield);

    const opener = fixture.nativeElement.querySelector('[data-testid="open-without-help"]') as HTMLButtonElement;
    opener.click();
    settle();

    expectDialogWithoutHelp();
    expect(editorTextbox()).toBeTruthy();

    // The caller still gets the edited text back, as before.
    typeIntoEditor('edited without help');
    dialogButton('Save').click();
    settle();

    expect(editorDialogIsOpen()).toBe(false);
    expect(host.savedWithoutHelp()).toBe('edited without help');
  }));

  it.each(['expression', 'plain'] as const)(
    'AC-14: Save in the dialog with %s help writes the edited text back to the field',
    (mode) =>
      fakeAsync(() => {
        render('textfield', mode === 'expression' ? EXPRESSION_VALUE : PLAIN_VALUES.textfield);
        clickEditButton();
        expect(learnMoreLinksInDialog()).toHaveLength(1);

        typeIntoEditor('edited text');

        // The help stays visible while the user edits.
        expect(learnMoreLinksInDialog()).toHaveLength(1);

        dialogButton('Save').click();
        settle();

        expect(editorDialogIsOpen()).toBe(false);
        expect(mode === 'expression' ? host.model().expression : host.model().value).toBe('edited text');
        expect(host.model().dynamic).toBe(mode === 'expression');
      })(),
  );

  it.each(['expression', 'plain'] as const)(
    'AC-14: Cancel with unsaved changes in the dialog with %s help asks for confirmation before closing',
    (mode) =>
      fakeAsync(() => {
        const initialValue = mode === 'expression' ? EXPRESSION_VALUE : PLAIN_VALUES.textfield;
        render('textfield', initialValue);
        clickEditButton();
        expect(learnMoreLinksInDialog()).toHaveLength(1);

        typeIntoEditor('unsaved text');
        // The change status is updated with a debounce.
        tick(500);
        settle();

        dialogButton('Cancel').click();
        settle();

        expect(normalize(document.body.textContent)).toContain(UNSAVED_CHANGES_WARNING);
        expect(editorDialogIsOpen()).toBe(true);

        clickDocumentButton('Yes');

        expect(normalize(document.body.textContent)).not.toContain(UNSAVED_CHANGES_WARNING);
        expect(editorDialogIsOpen()).toBe(false);
        expect(host.model()).toBe(initialValue);
      })(),
  );

  it('AC-14: Cancel without changes closes the dialog with help at once', fakeAsync(() => {
    render('textfield', EXPRESSION_VALUE);
    clickEditButton();
    expect(learnMoreLinksInDialog()).toHaveLength(1);

    dialogButton('Cancel').click();
    settle();

    expect(normalize(document.body.textContent)).not.toContain(UNSAVED_CHANGES_WARNING);
    expect(editorDialogIsOpen()).toBe(false);
    expect(host.model()).toBe(EXPRESSION_VALUE);
  }));
});
