import { inject, Injectable } from '@angular/core';
import {
  AppConfigContainerService,
  canLeaveComponent,
  DashletRegistryService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { AiGeneratePageComponent } from '../components/ai-generate-page/ai-generate-page.component';
import { AiGenerationsListComponent } from '../components/ai-generations-list/ai-generations-list.component';
import { AiSidebarMenuComponent } from '../components/ai-sidebar-menu/ai-sidebar-menu.component';
import { AiStartPageComponent } from '../components/ai-start-page/ai-start-page.component';
import {
  AI_GENERATE_PATH,
  AI_SIDEBAR_COMPONENT,
  AI_SIDEBAR_LOCATION,
  AI_START_PAGE_PATH,
} from '../shared/ai.constants';

@Injectable({ providedIn: 'root' })
export class AiFeatureRegistrationService {
  private readonly _appConfig = inject(AppConfigContainerService);
  private readonly _dashletRegistry = inject(DashletRegistryService);
  private readonly _viewRegistry = inject(ViewRegistryService);

  private isRegistered = false;

  register(): void {
    if (this.isRegistered) {
      return;
    }
    this.isRegistered = true;

    this.registerRoutes();
    this.registerSidebarMenu();
    this.setupHomeUrl();
  }

  private registerRoutes(): void {
    this._viewRegistry.registerRoute({
      path: AI_START_PAGE_PATH,
      component: AiStartPageComponent,
    });
    this._viewRegistry.registerRoute({
      path: AI_GENERATE_PATH,
      component: SimpleOutletComponent,
      children: [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: 'generate',
        },
        {
          path: 'generate',
          component: AiGeneratePageComponent,
          canDeactivate: [canLeaveComponent],
        },
        {
          path: 'generations',
          component: AiGenerationsListComponent,
        },
      ],
    });
  }

  private registerSidebarMenu(): void {
    this._dashletRegistry.registerDashlet(AI_SIDEBAR_COMPONENT, AiSidebarMenuComponent);
    this._viewRegistry.registerDashlet(AI_SIDEBAR_LOCATION, '', AI_SIDEBAR_COMPONENT, AI_SIDEBAR_COMPONENT);
  }

  private setupHomeUrl(): void {
    this._appConfig.setDefaultClientUrl(`/${AI_START_PAGE_PATH}`);
  }
}
