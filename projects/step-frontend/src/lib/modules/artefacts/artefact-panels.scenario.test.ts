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

type EditorType = 'For' | 'ForEach' | 'ThreadGroup' | 'RetryIfFails' | 'Session' | 'Sequence' | 'CallKeyword' | 'Sleep';
type PanelArtefact = AbstractArtefact & Record<string, unknown>;

interface EditorCase {
  type: EditorType;
  selector: string;
  title: string;
  configuredFields: Record<string, unknown>;
  outsideFields: Record<string, unknown>;
}

function constant<T extends string | number | boolean | null>(value: T): { dynamic: false; value: T } {
  return { dynamic: false, value };
}

const editors: EditorCase[] = [
  {
    type: 'For',
    selector: 'step-for',
    title: 'Handles',
    configuredFields: {
      item: constant('customCounter'),
      userItem: constant('customUser'),
      globalCounter: constant('customGlobal'),
    },
    outsideFields: { threads: constant(5) },
  },
  {
    type: 'ForEach',
    selector: 'step-for-each',
    title: 'Handles',
    configuredFields: {
      item: constant('customRow'),
      userItem: constant('customUser'),
      globalCounter: constant('customGlobal'),
    },
    outsideFields: { threads: constant(5) },
  },
  {
    type: 'ThreadGroup',
    selector: 'step-thread-group',
    title: 'Handles',
    configuredFields: {
      localItem: constant('customLocal'),
      userItem: constant('customUser'),
      item: constant('customGlobal'),
    },
    outsideFields: { pacing: constant(1000), users: constant(5) },
  },
  {
    type: 'RetryIfFails',
    selector: 'step-retry-if-fails',
    title: 'Advanced',
    configuredFields: { releaseTokens: constant(true), reportLastTryOnly: constant(true) },
    outsideFields: { maxRetries: constant(10) },
  },
  {
    type: 'Session',
    selector: 'step-session',
    title: 'Keyword routing',
    configuredFields: { token: constant('{"pool":"custom"}') },
    outsideFields: { remote: constant(false) },
  },
  {
    type: 'Sequence',
    selector: 'step-sequence',
    title: 'Advanced',
    configuredFields: { pacing: constant(1000) },
    outsideFields: { continueOnError: constant(true) },
  },
  {
    type: 'CallKeyword',
    selector: 'step-call-keyword',
    title: 'Keyword routing',
    configuredFields: { remote: constant(false), token: constant('{"pool":"custom"}') },
    outsideFields: { resultMap: constant('customResult') },
  },
  {
    type: 'Sleep',
    selector: 'step-sleep step-waiting-artefacts-advanced',
    title: 'Advanced',
    configuredFields: { releaseTokens: constant(true) },
    outsideFields: { duration: constant(1000) },
  },
];

let nextId = 0;

function createArtefact(type: EditorType, fields: Record<string, unknown> = {}): PanelArtefact {
  const handles = { userItem: constant('userId'), globalCounter: constant('gcounter') };
  const dataSource = { start: constant(1), end: constant(2), inc: constant(1) };
  const defaults: Record<EditorType, Record<string, unknown>> = {
    For: { ...handles, item: constant('counter'), dataSource, threads: constant(1), maxFailedLoops: constant(0) },
    ForEach: {
      ...handles,
      item: constant('row'),
      threads: constant(1),
      maxFailedLoops: constant(0),
      dataSourceType: DataSourceType.SEQUENCE,
      dataSource: { ...dataSource, protect: constant(false) },
    },
    ThreadGroup: {
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
    RetryIfFails: {
      maxRetries: constant(3),
      gracePeriod: constant(0),
      timeout: constant(0),
      releaseTokens: constant(false),
      reportLastTryOnly: constant(false),
    },
    Session: { token: constant('{}') },
    Sleep: { duration: constant(0), unit: constant('ms') },
    Sequence: { continueOnError: constant(false), pacing: constant(null) },
    CallKeyword: {
      function: constant('{"name":{"dynamic":false,"value":"Example keyword"}}'),
      argument: constant('{}'),
      resultMap: constant(''),
      remote: constant(true),
      token: constant('{}'),
    },
  };
  return {
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
    ...defaults[type],
    ...fields,
  };
}

function copyArtefact(artefact: PanelArtefact): PanelArtefact {
  return JSON.parse(JSON.stringify(artefact)) as PanelArtefact;
}

function settle(fixture: ComponentFixture<ArtefactDetailsComponent>): void {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  tick(300);
  fixture.detectChanges();
}

function withDetails(run: (fixture: ComponentFixture<ArtefactDetailsComponent>) => void): void {
  const fixture = TestBed.createComponent(ArtefactDetailsComponent);
  try {
    run(fixture);
  } finally {
    fixture.destroy();
    tick(1000);
  }
}

function openControl(fixture: ComponentFixture<ArtefactDetailsComponent>, artefact: PanelArtefact): void {
  fixture.componentRef.setInput('artefact', artefact);
  settle(fixture);
}

function panelHeader(
  fixture: ComponentFixture<ArtefactDetailsComponent>,
  panel: Pick<EditorCase, 'selector' | 'title'>,
): HTMLElement {
  const element: HTMLElement = fixture.nativeElement;
  const header = Array.from(element.querySelectorAll<HTMLElement>(`${panel.selector} mat-expansion-panel-header`)).find(
    (candidate) => {
      const title = candidate.querySelector('mat-panel-title');
      const label = title?.querySelector(':scope > span:first-child') ?? title;
      return label?.textContent?.trim() === panel.title;
    },
  );
  expect(header).toBeDefined();
  return header!;
}

function expectExpanded(
  fixture: ComponentFixture<ArtefactDetailsComponent>,
  panel: Pick<EditorCase, 'selector' | 'title'>,
  expanded: boolean,
): void {
  expect(panelHeader(fixture, panel).getAttribute('aria-expanded')).toBe(`${expanded}`);
}

function expectSection(
  fixture: ComponentFixture<ArtefactDetailsComponent>,
  panel: Pick<EditorCase, 'selector' | 'title'>,
  expanded: boolean,
  configured: boolean,
): void {
  const header = panelHeader(fixture, panel);
  expect(header.getAttribute('aria-expanded')).toBe(`${expanded}`);
  expect(header.querySelector('mat-panel-title .configured-badge')?.textContent?.trim()).toBe(
    configured ? 'Configured' : undefined,
  );
}

function editInput(fixture: ComponentFixture<ArtefactDetailsComponent>, selector: string, value: string): void {
  const element: HTMLElement = fixture.nativeElement;
  const input = element.querySelector<HTMLInputElement>(selector);
  expect(input).not.toBeNull();
  input!.value = value;
  input!.dispatchEvent(new Event('input', { bubbles: true }));
  settle(fixture);
}

describe('Artefact panel initialization', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtefactsModule, ArtefactDetailsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PlansService, useValue: { getArtefactTypes: () => of(editors.map((editor) => editor.type)) } },
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

  it('marks saved advanced settings without saving or changing the artefact', fakeAsync(() => {
    const artefact = createArtefact('RetryIfFails', { releaseTokens: constant(true) });
    const originalArtefact = copyArtefact(artefact);
    withDetails((fixture) => {
      const onSave = jest.spyOn(fixture.componentInstance.onSave, 'emit');
      openControl(fixture, artefact);
      expect(onSave).not.toHaveBeenCalled();
      expect(artefact).toEqual(originalArtefact);
      expectSection(fixture, { selector: 'step-retry-if-fails', title: 'Advanced' }, false, true);
    });
  }));

  it.each(editors)('marks only configured panel fields in $type', (editor) => {
    fakeAsync(() =>
      withDetails((fixture) => {
        openControl(fixture, createArtefact(editor.type));
        expectSection(fixture, editor, false, false);
        expectExpanded(fixture, { selector: ':scope > form', title: 'Properties' }, true);
        if (editor.type === 'ThreadGroup') {
          expectExpanded(fixture, { ...editor, title: 'Load distribution parameters' }, true);
          expectExpanded(fixture, { ...editor, title: 'Duration parameters' }, true);
        }

        openControl(fixture, createArtefact(editor.type, editor.outsideFields));
        expectSection(fixture, editor, false, false);

        for (const [field, value] of Object.entries(editor.configuredFields)) {
          const artefact = createArtefact(editor.type, { [field]: value });
          const original = copyArtefact(artefact);
          openControl(fixture, artefact);
          expectSection(fixture, editor, false, true);
          expect(artefact).toEqual(original);
        }
      }),
    )();
  });

  it('distinguishes unset or default fields from explicit overrides', fakeAsync(() => {
    withDetails((fixture) => {
      const handles = { selector: 'step-for', title: 'Handles' };
      const missingHandle = createArtefact('For');
      delete missingHandle['item'];
      openControl(fixture, missingHandle);
      expectSection(fixture, handles, false, false);
      for (const field of [null, { dynamic: false }, constant(null), constant('counter')]) {
        openControl(fixture, createArtefact('For', { item: field }));
        expectSection(fixture, handles, false, false);
      }
      openControl(fixture, createArtefact('For', { item: constant('') }));
      expectSection(fixture, handles, false, true);

      const advanced = { selector: 'step-sequence', title: 'Advanced' };
      const missingPacing = createArtefact('Sequence');
      delete missingPacing['pacing'];
      openControl(fixture, missingPacing);
      expectSection(fixture, advanced, false, false);
      for (const field of [null, { dynamic: false }, constant(null), constant(0)]) {
        openControl(fixture, createArtefact('Sequence', { pacing: field }));
        expectSection(fixture, advanced, false, false);
      }
      openControl(fixture, createArtefact('Sequence', { pacing: constant(1) }));
      expectSection(fixture, advanced, false, true);

      const waiting = { selector: 'step-waiting-artefacts-advanced', title: 'Advanced' };
      for (const field of [null, { dynamic: false }, constant(null), constant(false)]) {
        openControl(fixture, createArtefact('Sleep', { releaseTokens: field }));
        expectSection(fixture, waiting, false, false);
      }
    });
  }));

  it('treats only blank or empty-object token selectors as default content', fakeAsync(() => {
    withDetails((fixture) => {
      const routing = { selector: 'step-call-keyword', title: 'Keyword routing' };
      const missingToken = createArtefact('CallKeyword');
      delete missingToken['token'];
      openControl(fixture, missingToken);
      expectSection(fixture, routing, false, false);
      for (const field of [
        null,
        { dynamic: false },
        constant(null),
        constant(''),
        constant('  '),
        constant(' { \n } '),
      ]) {
        openControl(fixture, createArtefact('CallKeyword', { token: field }));
        expectSection(fixture, routing, false, false);
      }
      for (const value of ['{"pool":"custom"}', '[]', 'false', 'null', '{invalid']) {
        openControl(fixture, createArtefact('CallKeyword', { token: constant(value) }));
        expectSection(fixture, routing, false, true);
      }
      for (const field of [undefined, null, { dynamic: false }, constant(null), constant(true)]) {
        openControl(fixture, createArtefact('CallKeyword', { remote: field }));
        expectSection(fixture, routing, false, false);
      }
    });
  }));

  it('marks dynamic handle, boolean, pacing and selector fields even for default or empty expressions', fakeAsync(() => {
    withDetails((fixture) => {
      const cases = [
        {
          type: 'For',
          selector: 'step-for',
          title: 'Handles',
          field: 'item',
          value: 'counter',
          expression: "'counter'",
        },
        {
          type: 'RetryIfFails',
          selector: 'step-retry-if-fails',
          title: 'Advanced',
          field: 'releaseTokens',
          value: false,
          expression: 'false',
        },
        { type: 'Sequence', selector: 'step-sequence', title: 'Advanced', field: 'pacing', value: 0, expression: '0' },
        {
          type: 'Session',
          selector: 'step-session',
          title: 'Keyword routing',
          field: 'token',
          value: '{}',
          expression: "'{}'",
        },
        {
          type: 'Sleep',
          selector: 'step-sleep step-waiting-artefacts-advanced',
          title: 'Advanced',
          field: 'releaseTokens',
          value: false,
          expression: 'false',
        },
      ] satisfies (Pick<EditorCase, 'type' | 'selector' | 'title'> & {
        field: string;
        value: string | number | boolean;
        expression: string;
      })[];
      for (const editor of cases) {
        for (const expression of [editor.expression, '']) {
          openControl(
            fixture,
            createArtefact(editor.type, { [editor.field]: { dynamic: true, value: editor.value, expression } }),
          );
          expectSection(fixture, editor, false, true);
        }
        openControl(fixture, createArtefact(editor.type, { [editor.field]: { dynamic: true, expression: '' } }));
        expectSection(fixture, editor, false, true);
        openControl(
          fixture,
          createArtefact(editor.type, {
            [editor.field]: { dynamic: false, value: editor.value, expression: 'configuredExpression' },
          }),
        );
        expectSection(fixture, editor, false, false);
      }
    });
  }));

  it('preserves manual toggles through edits, saves and same-ID updates, then recalculates on selection and reopening', fakeAsync(() => {
    const handles = { selector: 'step-for', title: 'Handles' };
    const configured = createArtefact('For', { item: constant('customCounter') });
    const defaults = createArtefact('For');
    withDetails((fixture) => {
      openControl(fixture, configured);
      expectSection(fixture, handles, false, true);
      const onSave = jest.spyOn(fixture.componentInstance.onSave, 'emit');
      panelHeader(fixture, handles).click();
      settle(fixture);
      expectSection(fixture, handles, true, true);
      panelHeader(fixture, handles).click();
      settle(fixture);
      expectSection(fixture, handles, false, true);
      expect(onSave).not.toHaveBeenCalled();

      editInput(fixture, 'step-for step-dynamic-textfield[name="end"] input', '9');
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenLastCalledWith(configured);
      expect(configured['dataSource']).toMatchObject({ end: { value: 9 } });
      expectSection(fixture, handles, false, true);
      onSave.mockClear();
      openControl(fixture, copyArtefact(configured));
      expectSection(fixture, handles, false, true);
      expect(onSave).not.toHaveBeenCalled();

      openControl(fixture, defaults);
      expectSection(fixture, handles, false, false);
      panelHeader(fixture, handles).click();
      settle(fixture);
      expectSection(fixture, handles, true, false);
      expect(onSave).not.toHaveBeenCalled();
      editInput(fixture, 'step-for step-dynamic-textfield[name="item"] input', 'temporaryCounter');
      expectSection(fixture, handles, true, true);
      editInput(fixture, 'step-for step-dynamic-textfield[name="item"] input', 'counter');
      expect(onSave).toHaveBeenCalledTimes(2);
      expect(defaults['item']).toMatchObject({ value: 'counter', dynamic: false });
      expectSection(fixture, handles, true, false);
      openControl(fixture, copyArtefact(defaults));
      expectSection(fixture, handles, true, false);

      openControl(fixture, configured);
      expectSection(fixture, handles, false, true);
      panelHeader(fixture, handles).click();
      settle(fixture);
      expectSection(fixture, handles, true, true);
      openControl(fixture, defaults);
      expectSection(fixture, handles, false, false);
      openControl(fixture, configured);
      expectSection(fixture, handles, false, true);
      panelHeader(fixture, handles).click();
      settle(fixture);
      expectSection(fixture, handles, true, true);
    });
    withDetails((fixture) => {
      openControl(fixture, copyArtefact(configured));
      expectSection(fixture, handles, false, true);
      openControl(fixture, copyArtefact(defaults));
      expectSection(fixture, handles, false, false);
    });
  }));

  it('preserves waiting-panel toggles during saves and recalculates on selection and read-only reopening', fakeAsync(() => {
    const advanced = { selector: 'step-waiting-artefacts-advanced', title: 'Advanced' };
    const defaults = createArtefact('Sleep', { releaseTokens: constant(false) });
    const configured = createArtefact('Sleep', { releaseTokens: constant(true) });
    withDetails((fixture) => {
      openControl(fixture, defaults);
      expectSection(fixture, advanced, false, false);
      const onSave = jest.spyOn(fixture.componentInstance.onSave, 'emit');
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expect(onSave).not.toHaveBeenCalled();
      const element: HTMLElement = fixture.nativeElement;
      const releaseTokens = element.querySelector<HTMLInputElement>(
        'step-waiting-artefacts-advanced step-dynamic-checkbox[name="releaseTokens"] input',
      )!;
      for (const checked of [true, false]) {
        releaseTokens.click();
        settle(fixture);
        expect(defaults['releaseTokens']).toMatchObject({ dynamic: false, value: checked });
        expectSection(fixture, advanced, true, checked);
      }
      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSave).toHaveBeenLastCalledWith(defaults);

      openControl(fixture, configured);
      expectSection(fixture, advanced, false, true);
      onSave.mockClear();
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, true, true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expect(onSave).not.toHaveBeenCalled();
      editInput(fixture, 'step-sleep step-dynamic-time-input[name="duration"] input', '9');
      expect(configured['duration']).toMatchObject({ value: 9 });
      expect(onSave).toHaveBeenCalledTimes(1);
      expectSection(fixture, advanced, false, true);
      onSave.mockClear();
      openControl(fixture, copyArtefact(configured));
      expectSection(fixture, advanced, false, true);
      expect(onSave).not.toHaveBeenCalled();
      openControl(fixture, defaults);
      expectSection(fixture, advanced, false, false);
      openControl(fixture, configured);
      expectSection(fixture, advanced, false, true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, true, true);
    });

    withDetails((fixture) => {
      fixture.componentRef.setInput('readonly', true);
      const artefact = copyArtefact(configured);
      const original = copyArtefact(artefact);
      const onSave = jest.spyOn(fixture.componentInstance.onSave, 'emit');
      openControl(fixture, artefact);
      expectSection(fixture, advanced, false, true);
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector<HTMLInputElement>('step-waiting-artefacts-advanced input')!.disabled).toBe(true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, true, true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, false, true);
      expect(onSave).not.toHaveBeenCalled();
      expect(artefact).toEqual(original);
    });
  }));

  it('marks configured read-only settings with disabled fields and no saves or mutations', fakeAsync(() => {
    const artefact = createArtefact('RetryIfFails', { releaseTokens: constant(true) });
    const original = copyArtefact(artefact);
    const advanced = { selector: 'step-retry-if-fails', title: 'Advanced' };
    withDetails((fixture) => {
      fixture.componentRef.setInput('readonly', true);
      const onSave = jest.spyOn(fixture.componentInstance.onSave, 'emit');
      openControl(fixture, artefact);
      expectSection(fixture, advanced, false, true);
      const element: HTMLElement = fixture.nativeElement;
      const inputs = Array.from(element.querySelectorAll<HTMLInputElement>('step-retry-if-fails input'));
      expect(inputs.length).toBeGreaterThan(0);
      expect(inputs.every((input) => input.disabled)).toBe(true);
      expect(
        element.querySelector<HTMLInputElement>('step-dynamic-checkbox[name="releaseTokens"] input')!.checked,
      ).toBe(true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, true, true);
      panelHeader(fixture, advanced).click();
      settle(fixture);
      expectSection(fixture, advanced, false, true);
      expect(onSave).not.toHaveBeenCalled();
      expect(artefact).toEqual(original);
    });
  }));
});
