import { Component, forwardRef, input } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AsyncPipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  AppConfigContainerService,
  AuthService,
  CredentialsService,
  DashletRegistryService,
  EntityRefService,
  GlobalReloadService,
  HasRightPipe,
  IDE_MODE,
  IdeStateStrategyService,
  MenuItemsOverrideConfigService,
  NavigatorService,
  Plan,
  PrivateApplicationService,
  SESSION_STORAGE,
  ViewRegistryService,
} from '@exense/step-core';
import { IdeModeModule } from './ide-mode.module';
import { IdeStateService } from './services/ide-state.service';
import { IdeRemoteDefaultsService } from '../ide-remote/services/ide-remote-defaults.service';

@Component({
  selector: 'step-read-only-plan-actions-probe',
  imports: [AsyncPipe, HasRightPipe],
  providers: [{ provide: EntityRefService, useExisting: forwardRef(() => ReadOnlyPlanActionsProbeComponent) }],
  template: `
    <button class="view" [disabled]="!('plan-read' | hasRight | async)">View</button>
    <button class="edit" [disabled]="!('plan-write' | hasRight | async)">Edit</button>
    <button class="delete" [disabled]="!('plan-delete' | hasRight | async)">Delete</button>
    <button class="execute" [disabled]="!('plan-execute' | hasRight | async)">Execute</button>
    <button class="clone" [disabled]="!('plan-write' | hasRight: true | async)">Clone</button>
  `,
})
class ReadOnlyPlanActionsProbeComponent implements EntityRefService<Plan> {
  readonly currentEntity = input<Plan>();
}

describe('Studio read-only plan permissions', () => {
  it('keeps viewing, execution and cloning available while blocking changes to the selected read-only plan', fakeAsync(() => {
    let hasPackage = true;
    TestBed.configureTestingModule({
      imports: [ReadOnlyPlanActionsProbeComponent],
      providers: [
        provideRouter([]),
        { provide: IDE_MODE, useValue: true },
        {
          provide: IdeStateService,
          useValue: {
            get hasPackage(): boolean {
              return hasPackage;
            },
            initialize: jest.fn(),
          },
        },
        { provide: IdeRemoteDefaultsService, useValue: { initialize: jest.fn() } },
        { provide: IdeStateStrategyService, useValue: { useStrategy: jest.fn() } },
        { provide: MenuItemsOverrideConfigService, useValue: { configure: jest.fn() } },
        { provide: DashletRegistryService, useValue: { registerDashlet: jest.fn() } },
        { provide: ViewRegistryService, useValue: { registerRoute: jest.fn(), registerDashlet: jest.fn() } },
        { provide: PrivateApplicationService, useValue: { getApplicationConfiguration: () => of({}) } },
        { provide: AppConfigContainerService, useValue: { conf: { authentication: false } } },
        { provide: CredentialsService, useValue: {} },
        { provide: NavigatorService, useValue: {} },
        { provide: SESSION_STORAGE, useValue: sessionStorage },
        { provide: GlobalReloadService, useValue: { register: jest.fn(), unRegister: jest.fn() } },
      ],
    });
    TestBed.runInInjectionContext(() => new IdeModeModule());
    const fixture = TestBed.createComponent(ReadOnlyPlanActionsProbeComponent);
    const element: HTMLElement = fixture.nativeElement;
    const disabled = (action: string): boolean => element.querySelector<HTMLButtonElement>(`.${action}`)!.disabled;
    const settle = (): void => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    };
    const plan: Plan = {
      _class: 'step.core.plans.Plan',
      attributes: { name: 'plainTestPlanNoRoot' },
      customFields: { readOnly: true },
    };
    fixture.componentRef.setInput('currentEntity', plan);
    settle();

    expect(disabled('view')).toBe(false);
    expect(disabled('execute')).toBe(false);
    expect(disabled('clone')).toBe(false);
    expect(disabled('edit')).toBe(true);
    expect(disabled('delete')).toBe(true);

    fixture.componentRef.setInput('currentEntity', { ...plan, customFields: { readOnly: false } });
    settle();
    expect(disabled('edit')).toBe(false);
    expect(disabled('delete')).toBe(false);

    hasPackage = false;
    TestBed.inject(AuthService).triggerRightCheck();
    settle();
    expect(disabled('view')).toBe(false);
    expect(disabled('execute')).toBe(true);
    expect(disabled('clone')).toBe(true);
    fixture.destroy();
  }));
});
