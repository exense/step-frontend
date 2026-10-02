import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import {
  ArtefactLinks,
  AugmentedPlansService,
  CommonEntitiesUrlsService,
  ControllerService,
  Execution,
  IDE_MODE,
  RepositoryObjectReference,
} from '@exense/step-core';
import { of, Subject } from 'rxjs';
import { AltExecutionRepositoryLinkComponent } from './alt-execution-repository-link.component';

describe('Execution plan navigation', () => {
  let fixture: ComponentFixture<AltExecutionRepositoryLinkComponent>;
  const getArtefactLinks = jest.fn();

  const execution = (id: string): Execution => ({
    id,
    planId: `plan-${id}`,
    executionParameters: {
      repositoryObject: {
        repositoryID: 'azureDevops',
        repositoryParameters: { id },
      },
    },
  });

  beforeEach(async () => {
    getArtefactLinks.mockReset();
    await TestBed.configureTestingModule({
      declarations: [AltExecutionRepositoryLinkComponent],
      providers: [
        { provide: ControllerService, useValue: { getArtefactLinks } },
        { provide: CommonEntitiesUrlsService, useValue: { planEditorUrl: (id: string) => `/plans/${id}` } },
        { provide: AugmentedPlansService, useValue: { findPlansByAttributes: () => of([]) } },
        { provide: IDE_MODE, useValue: false },
      ],
    })
      .overrideComponent(AltExecutionRepositoryLinkComponent, {
        set: {
          template: '@for (link of repositoryLinks(); track link.url) { <a [href]="link.url">{{ link.label }}</a> }',
        },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AltExecutionRepositoryLinkComponent);
  });

  it('shows only the current execution links when its repository changes', fakeAsync(() => {
    const suiteResponse = new Subject<ArtefactLinks>();
    getArtefactLinks.mockImplementation((repository: RepositoryObjectReference) => {
      const id = repository.repositoryParameters?.['id'];
      return id === 'suite'
        ? suiteResponse
        : of({
            links: [
              { description: 'Case plan', url: 'https://example.test/case/plan' },
              { description: 'Case definition', url: 'https://example.test/case/definition' },
            ],
          });
    });
    const links = (): Array<string | null> =>
      Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>).map((link) =>
        link.getAttribute('href'),
      );
    const show = (id: string): void => {
      fixture.componentRef.setInput('execution', execution(id));
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
    };

    show('case');
    expect(links()).toEqual(['https://example.test/case/plan', 'https://example.test/case/definition']);

    show('suite');
    expect(links()).toEqual([]);
    suiteResponse.next({ links: [{ description: 'Suite plan', url: 'https://example.test/suite/plan' }] });
    fixture.detectChanges();
    expect(links()).toEqual(['https://example.test/suite/plan']);

    show('suite');
    expect(getArtefactLinks).toHaveBeenCalledTimes(2);

    show('case');
    expect(links()).toEqual(['https://example.test/case/plan', 'https://example.test/case/definition']);
  }));
});
