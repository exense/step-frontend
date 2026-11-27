import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AbstractArtefact,
  ArtefactDetailsComponent,
  AugmentedKeywordsService,
  PlansService,
  PrivateApplicationService,
  PrivateDataPoolPluginService,
  ScreensService,
} from '@exense/step-core';
import { of } from 'rxjs';
import { ArtefactsModule } from './artefacts.module';
import { DataSourceType } from './types/data-source-type.enum';

type EditorType = 'For' | 'ForEach' | 'ThreadGroup' | 'RetryIfFails' | 'Sequence' | 'Session' | 'CallKeyword' | 'Sleep';
type ArtefactFields = Record<string, unknown>;
type SavedControl = AbstractArtefact & ArtefactFields;
type Details = ComponentFixture<ArtefactDetailsComponent>;

interface EditorCase {
  type: EditorType;
  title: string;
  defaults: ArtefactFields;
  configured: ArtefactFields;
  outsideSection: ArtefactFields;
}

function constant<T extends string | number | boolean | null>(value: T): { dynamic: false; value: T } {
  return { dynamic: false, value };
}

const loopDefaults = {
  userItem: constant('userId'),
  globalCounter: constant('gcounter'),
  threads: constant(1),
  maxFailedLoops: constant(0),
};
const dataSource = { start: constant(1), end: constant(2), inc: constant(1) };
const editors: EditorCase[] = [
  {
    type: 'For',
    title: 'Handles',
    defaults: { ...loopDefaults, item: constant('counter'), dataSource },
    configured: { item: constant(''), userItem: constant('customUser'), globalCounter: constant('customGlobal') },
    outsideSection: { threads: constant(5) },
  },
  {
    type: 'ForEach',
    title: 'Handles',
    defaults: {
      ...loopDefaults,
      item: constant('row'),
      dataSourceType: DataSourceType.SEQUENCE,
      dataSource: { ...dataSource, protect: constant(false) },
    },
    configured: {
      item: constant('customRow'),
      userItem: constant('customUser'),
      globalCounter: constant('customGlobal'),
    },
    outsideSection: { threads: constant(5) },
  },
  {
    type: 'ThreadGroup',
    title: 'Handles',
    defaults: {
      localItem: constant('literationId'),
      userItem: constant('userId'),
      item: constant('gcounter'),
      users: constant(1),
      pacing: constant(0),
      rampup: constant(0),
      pack: constant(1),
      startOffset: constant(0),
      iterations: constant(1),
      maxDuration: constant(0),
    },
    configured: {
      localItem: constant('customLocal'),
      userItem: constant('customUser'),
      item: constant('customGlobal'),
    },
    outsideSection: { pacing: constant(1000), users: constant(5) },
  },
  {
    type: 'RetryIfFails',
    title: 'Advanced',
    defaults: {
      maxRetries: constant(3),
      gracePeriod: constant(0),
      timeout: constant(0),
      releaseTokens: constant(false),
      reportLastTryOnly: constant(false),
    },
    configured: { releaseTokens: constant(true), reportLastTryOnly: constant(true) },
    outsideSection: { maxRetries: constant(10) },
  },
  {
    type: 'Sequence',
    title: 'Advanced',
    defaults: { continueOnError: constant(false), pacing: constant(null) },
    configured: { pacing: constant(1) },
    outsideSection: { continueOnError: constant(true) },
  },
  {
    type: 'Session',
    title: 'Keyword routing',
    defaults: { token: constant('{}') },
    configured: { token: constant('{"pool":"custom"}') },
    outsideSection: {},
  },
  {
    type: 'CallKeyword',
    title: 'Keyword routing',
    defaults: {
      function: constant('{"name":{"dynamic":false,"value":"Example keyword"}}'),
      argument: constant('{}'),
      resultMap: constant(''),
      remote: constant(true),
      token: constant('{}'),
    },
    configured: { remote: constant(false), token: constant('{"pool":"custom"}') },
    outsideSection: { resultMap: constant('customResult') },
  },
  {
    type: 'Sleep',
    title: 'Advanced',
    defaults: { duration: constant(0), unit: constant('ms'), releaseTokens: constant(false) },
    configured: { releaseTokens: constant(true) },
    outsideSection: { duration: constant(1000) },
  },
];

let nextId = 0;

function savedControl(type: EditorType, fields: ArtefactFields = {}): SavedControl {
  const defaults = editors.find((editor) => editor.type === type)!.defaults;
  return copyControl({
    id: `saved-${type}-${++nextId}`,
    _class: type,
    attributes: { name: type },
    dynamicName: constant(''),
    useDynamicName: false,
    description: '',
    children: [],
    instrumentNode: constant(false),
    skipNode: constant(false),
    continueParentNodeExecutionOnError: constant(false),
    ...defaults,
    ...fields,
  });
}

function copyControl(control: SavedControl): SavedControl {
  return JSON.parse(JSON.stringify(control)) as SavedControl;
}

function settle(details: Details): void {
  details.detectChanges();
  tick();
  details.detectChanges();
  tick(300);
  details.detectChanges();
}

function openControl(details: Details, control: SavedControl): void {
  details.componentRef.setInput('artefact', control);
  settle(details);
}

function withDetails(run: (details: Details) => void): void {
  const details = TestBed.createComponent(ArtefactDetailsComponent);
  try {
    run(details);
  } finally {
    details.destroy();
    tick(1000);
  }
}

function sectionToggle(details: Details, title: string): HTMLElement {
  const root: HTMLElement = details.nativeElement;
  const toggles = Array.from(root.querySelectorAll<HTMLElement>('[role="button"][aria-expanded]'));
  const toggle = toggles.find((candidate) => candidate.textContent?.trim().startsWith(title));
  if (!toggle) {
    throw new Error(`Could not find the ${title} section toggle`);
  }
  return toggle;
}

function sectionState(details: Details, title: string): { expanded: boolean; configured: boolean } {
  const toggle = sectionToggle(details, title);
  const textAfterTitle = toggle.textContent?.trim().slice(title.length);
  return {
    expanded: toggle.getAttribute('aria-expanded') === 'true',
    configured: /\bConfigured\b/.test(textAfterTitle ?? ''),
  };
}

function expectSection(details: Details, title: string, expanded: boolean, configured: boolean): void {
  expect(sectionState(details, title)).toEqual({ expanded, configured });
}

function toggleSection(details: Details, title: string): void {
  sectionToggle(details, title).click();
  settle(details);
}

function sectionContent(details: Details, title: string): HTMLElement {
  const toggle = sectionToggle(details, title);
  const content = toggle.ownerDocument.getElementById(toggle.getAttribute('aria-controls') ?? '');
  if (!content) {
    throw new Error(`Could not find the content controlled by the ${title} section toggle`);
  }
  return content;
}

function inputByLabel(root: HTMLElement, text: string): HTMLInputElement {
  const label = Array.from(root.querySelectorAll('label')).find((candidate) => candidate.textContent?.trim() === text);
  if (label?.control instanceof HTMLInputElement) {
    return label.control;
  }
  for (
    let container = label?.parentElement;
    container && root.contains(container);
    container = container.parentElement
  ) {
    const inputs = container.querySelectorAll<HTMLInputElement>('input');
    if (inputs.length === 1) {
      return inputs[0];
    }
  }
  throw new Error(`Could not find an input beside the ${text} label`);
}

function editInput(details: Details, input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  settle(details);
}

function clickDescribedButton(details: Details, title: string, description: string): void {
  const buttons = Array.from(sectionContent(details, title).querySelectorAll<HTMLButtonElement>('button'));
  const button = buttons.find((candidate) => {
    const ids = candidate.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
    return ids.some((id) => candidate.ownerDocument.getElementById(id)?.textContent?.trim() === description);
  });
  if (!button) {
    throw new Error(`Could not find the button with description ${description}`);
  }
  button.click();
  settle(details);
}

const staticOverrides = editors.flatMap(({ type, title, configured }) =>
  Object.entries(configured).map(([field, value]) => ({ type, title, field, value })),
);

const savedExpressions = [
  { type: 'For', title: 'Handles', fields: { item: { dynamic: true, expression: '' } } },
  { type: 'Sleep', title: 'Advanced', fields: { releaseTokens: { dynamic: true, expression: 'false' } } },
  { type: 'Session', title: 'Keyword routing', fields: { token: { dynamic: true, expression: "'{}'" } } },
] satisfies { type: EditorType; title: string; fields: ArtefactFields }[];

describe('Configured plan control sections', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtefactsModule, ArtefactDetailsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PlansService, useValue: { getArtefactTypes: () => of(editors.map(({ type }) => type)) } },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
        { provide: PrivateDataPoolPluginService, useValue: {} },
        {
          provide: AugmentedKeywordsService,
          useValue: {
            lookupCallFunctionWithBindings: () =>
              of({ id: 'example-keyword', attributes: { name: 'Example keyword' } }),
          },
        },
        {
          provide: ScreensService,
          useValue: { getInputsForScreenPost: () => of([{ id: 'attributes.name', type: 'TEXT' }]) },
        },
      ],
    }).compileComponents();
  });

  it.each(editors)(
    'AC-1 leaves $type $title collapsed and unmarked at defaults or unset',
    ({ type, title, configured, outsideSection }) => {
      fakeAsync(() =>
        withDetails((details) => {
          openControl(details, savedControl(type));
          expectSection(details, title, false, false);

          openControl(details, savedControl(type, outsideSection));
          expectSection(details, title, false, false);

          const unsetFields = Object.fromEntries(Object.keys(configured).map((field) => [field, undefined]));
          openControl(details, savedControl(type, unsetFields));
          expectSection(details, title, false, false);
        }),
      )();
    },
  );

  it('AC-1 treats zero pacing and blank or empty-object selectors as defaults', fakeAsync(() => {
    withDetails((details) => {
      openControl(details, savedControl('Sequence', { pacing: constant(0) }));
      expectSection(details, 'Advanced', false, false);

      for (const token of [constant('  '), constant(' { \n } '), constant(null)]) {
        openControl(details, savedControl('CallKeyword', { token }));
        expectSection(details, 'Keyword routing', false, false);
      }
    });
  }));

  it.each(staticOverrides)(
    'AC-2 marks $type $title when only $field differs from its default',
    ({ type, title, field, value }) => {
      fakeAsync(() =>
        withDetails((details) => {
          const control = savedControl(type, { [field]: value });
          const original = copyControl(control);
          const onSave = jest.fn();
          details.componentInstance.onSave.subscribe(onSave);

          openControl(details, control);

          expect(onSave).not.toHaveBeenCalled();
          expect(control).toEqual(original);
          expectSection(details, title, false, true);
        }),
      )();
    },
  );

  it.each(['0', ''])('AC-3 marks Advanced after enabling dynamic pacing with expression "%s"', (expression) => {
    fakeAsync(() =>
      withDetails((details) => {
        const onSave = jest.fn();
        details.componentInstance.onSave.subscribe(onSave);
        openControl(details, savedControl('Sequence', { pacing: constant(0) }));
        toggleSection(details, 'Advanced');
        expectSection(details, 'Advanced', true, false);

        clickDescribedButton(details, 'Advanced', 'Use a dynamic expression to set this attribute');
        const input = inputByLabel(sectionContent(details, 'Advanced'), 'Pacing');
        editInput(details, input, expression);
        expect(onSave).toHaveBeenLastCalledWith(
          expect.objectContaining({ pacing: expect.objectContaining({ dynamic: true, expression }) }),
        );
        expectSection(details, 'Advanced', true, true);
      }),
    )();
  });

  it.each(savedExpressions)(
    'AC-3 marks $type $title with a saved empty or default expression',
    ({ type, title, fields }) => {
      fakeAsync(() =>
        withDetails((details) => {
          openControl(details, savedControl(type, fields));
          expectSection(details, title, false, true);
        }),
      )();
    },
  );

  it('AC-4 updates Handles through edits and saves while preserving manual expansion and collapse', fakeAsync(() => {
    withDetails((details) => {
      const control = savedControl('For');
      const onSave = jest.fn();
      details.componentInstance.onSave.subscribe(onSave);
      openControl(details, control);
      toggleSection(details, 'Handles');
      expect(onSave).not.toHaveBeenCalled();
      expectSection(details, 'Handles', true, false);

      const handles = sectionContent(details, 'Handles');
      const counter = inputByLabel(handles, 'Counter variable (handle)');
      const user = inputByLabel(handles, 'UserId variable (handle)');
      editInput(details, counter, 'temporaryCounter');
      expect(onSave).toHaveBeenLastCalledWith(
        expect.objectContaining({ item: expect.objectContaining({ value: 'temporaryCounter' }) }),
      );
      const afterFirstEdit = sectionState(details, 'Handles');

      editInput(details, user, 'temporaryUser');
      editInput(details, counter, 'counter');
      const withOneOverrideLeft = sectionState(details, 'Handles');

      toggleSection(details, 'Handles');
      const afterCollapsing = sectionState(details, 'Handles');
      onSave.mockClear();
      const root: HTMLElement = details.nativeElement;
      editInput(details, inputByLabel(root, 'End'), '9');
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          dataSource: expect.objectContaining({ end: expect.objectContaining({ value: 9 }) }),
        }),
      );
      openControl(details, copyControl(control));
      const afterSavingWhileCollapsed = sectionState(details, 'Handles');

      toggleSection(details, 'Handles');
      editInput(details, inputByLabel(sectionContent(details, 'Handles'), 'UserId variable (handle)'), 'userId');
      expect(onSave).toHaveBeenLastCalledWith(
        expect.objectContaining({ userItem: expect.objectContaining({ value: 'userId' }) }),
      );
      const afterRestoringDefault = sectionState(details, 'Handles');
      openControl(details, copyControl(onSave.mock.lastCall![0]));
      expect({
        afterFirstEdit,
        withOneOverrideLeft,
        afterCollapsing,
        afterSavingWhileCollapsed,
        afterRestoringDefault,
        afterSavingWhileExpanded: sectionState(details, 'Handles'),
      }).toEqual({
        afterFirstEdit: { expanded: true, configured: true },
        withOneOverrideLeft: { expanded: true, configured: true },
        afterCollapsing: { expanded: false, configured: true },
        afterSavingWhileCollapsed: { expanded: false, configured: true },
        afterRestoringDefault: { expanded: true, configured: false },
        afterSavingWhileExpanded: { expanded: true, configured: false },
      });
    });
  }));

  it.each(editors)('AC-5 resets $type $title when switching controls', ({ type, title, configured }) => {
    fakeAsync(() =>
      withDetails((details) => {
        const defaults = savedControl(type);
        const configuredControl = savedControl(type, configured);
        openControl(details, defaults);
        toggleSection(details, title);
        expectSection(details, title, true, false);

        openControl(details, configuredControl);
        expectSection(details, title, false, true);
        toggleSection(details, title);
        expectSection(details, title, true, true);

        openControl(details, defaults);
        expectSection(details, title, false, false);
        openControl(details, configuredControl);
        expectSection(details, title, false, true);
      }),
    )();
  });

  it.each(editors)('AC-5 reopens saved $type $title collapsed in read-only mode', ({ type, title, configured }) => {
    fakeAsync(() =>
      withDetails((details) => {
        details.componentRef.setInput('readonly', true);
        const onSave = jest.fn();
        details.componentInstance.onSave.subscribe(onSave);
        openControl(details, savedControl(type, configured));
        expectSection(details, title, false, true);

        toggleSection(details, title);
        expectSection(details, title, true, true);
        toggleSection(details, title);
        expectSection(details, title, false, true);
        expect(onSave).not.toHaveBeenCalled();

        openControl(details, savedControl(type));
        expectSection(details, title, false, false);
      }),
    )();
  });
});
