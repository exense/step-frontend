import { Component, input, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ArtefactLinks,
  AugmentedPlansService,
  AutomationPackageDescriptor,
  CommonEntitiesUrlsService,
  ControllerService,
  Execution,
  IDE_MODE,
  IdeStateStrategyService,
  Plan,
  RepositoryObjectReference,
  StepBasicsModule,
} from '@exense/step-core';
import { of, Subject } from 'rxjs';
import { AltExecutionRepositoryLinkComponent } from './alt-execution-repository-link.component';
import { AltExecutionPackageWarningComponent } from '../alt-execution-package-warning/alt-execution-package-warning.component';

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

@Component({
  selector: 'step-execution-package-navigation-scenario',
  template: `
    <step-alt-execution-package-warning [execution]="execution()" />
    <step-alt-execution-repository-link [execution]="execution()" />
  `,
  standalone: false,
})
class ExecutionPackageNavigationScenarioComponent {
  readonly execution = input.required<Execution>();
}

describe('Studio execution package navigation', () => {
  let fixture: ComponentFixture<ExecutionPackageNavigationScenarioComponent>;
  const packageA = { name: 'Package A', directory: '/packages/a' };
  const packageB = { name: 'Package B', directory: '/packages/b' };
  const currentPackage = signal<AutomationPackageDescriptor | undefined>(packageB);
  const findPlansByAttributes = jest.fn();
  const originalExecution: Execution = {
    id: 'package-a-execution',
    planId: 'isolated-plan-id',
    executionParameters: {
      isolatedExecution: true,
      repositoryObject: {
        repositoryID: 'isolatedAutomationPackage',
        repositoryParameters: { includePlans: 'Smoke', wrapPlans: 'false', apName: packageA.name },
      },
    },
  };
  const plan = (id: string): Plan => ({ _class: 'step.core.plans.Plan', id, attributes: { name: 'Smoke' } });
  const render = (): void => {
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();
  };
  const expectDisabledLink = (): void => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.plan-link');
    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip).message).toBe(
      'Load the Automation Package containing this plan in order to open it',
    );
  };

  beforeEach(async () => {
    currentPackage.set(packageB);
    findPlansByAttributes.mockReset();
    findPlansByAttributes.mockReturnValue(of([plan('package-b-smoke')]));
    await TestBed.configureTestingModule({
      imports: [StepBasicsModule, RouterTestingModule, NoopAnimationsModule, AltExecutionPackageWarningComponent],
      declarations: [AltExecutionRepositoryLinkComponent, ExecutionPackageNavigationScenarioComponent],
      providers: [
        { provide: IDE_MODE, useValue: true },
        { provide: IdeStateStrategyService, useValue: { currentPackage } },
        { provide: ControllerService, useValue: { getArtefactLinks: jest.fn() } },
        { provide: AugmentedPlansService, useValue: { findPlansByAttributes } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ExecutionPackageNavigationScenarioComponent);
    fixture.componentRef.setInput('execution', originalExecution);
  });

  it('blocks a different package and restores navigation when the execution package opens', fakeAsync(() => {
    render();
    expect(findPlansByAttributes).not.toHaveBeenCalled();
    expectDisabledLink();
    expect(fixture.nativeElement.querySelector('.display-alert.warning').textContent).toContain(
      'This execution belongs to a different Automation Package than the one currently open.',
    );

    findPlansByAttributes.mockReturnValue(of([plan('package-a-smoke')]));
    currentPackage.set(packageA);
    render();
    expect(findPlansByAttributes).toHaveBeenCalledTimes(1);
    expect(findPlansByAttributes).toHaveBeenCalledWith({ name: 'Smoke' });
    expect(fixture.nativeElement.querySelector('a.plan-link').getAttribute('href')).toBe(
      '/plans/editor/package-a-smoke',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  }));

  it('ignores an outstanding name lookup after a package switch and repeats it on return', fakeAsync(() => {
    const originalResponse = new Subject<Plan[]>();
    findPlansByAttributes.mockReturnValueOnce(originalResponse).mockReturnValue(of([plan('package-a-reloaded-smoke')]));
    currentPackage.set(packageA);
    render();
    expect(findPlansByAttributes).toHaveBeenCalledTimes(1);

    currentPackage.set(packageB);
    render();
    expect(findPlansByAttributes).toHaveBeenCalledTimes(1);
    expectDisabledLink();
    originalResponse.next([plan('stale-package-a-smoke')]);
    render();
    expectDisabledLink();

    currentPackage.set(packageA);
    render();
    expect(findPlansByAttributes).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('a.plan-link').getAttribute('href')).toBe(
      '/plans/editor/package-a-reloaded-smoke',
    );
  }));
});
