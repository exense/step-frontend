import { inject, NgModule } from '@angular/core';
import {
  AugmentedPlansService,
  checkEntityGuardFactory,
  CommonEntitiesUrlsService,
  CustomCellRegistryService,
  dialogRoute,
  EntityRegistry,
  ExportDialogComponent,
  ImportDialogComponent,
  PlanCreateDialogComponent,
  PlanLinkComponent,
  preloadScreenDataResolver,
  schedulePlanRoute,
  stepRouteAdditionalConfig,
  SimpleOutletComponent,
  ViewRegistryService,
  PlanContextApiService,
} from '@exense/step-core';
import { AltExecutionLaunchDialogComponent, ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';
import { PlansBulkOperationsRegisterService } from './injectables/plans-bulk-operations-register.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { PurePlanContextApiService } from './injectables/pure-plan-context-api.service';

@NgModule({
  declarations: [PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
  imports: [StepCommonModule, ExecutionModule, PlanEditorModule],
  exports: [PlanEditorModule, PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _planBulkOperations: PlansBulkOperationsRegisterService,
    _cellsRegister: CustomCellRegistryService,
    _viewRegistry: ViewRegistryService,
  ) {
    _planBulkOperations.register();
    _entityRegistry.register('plans', 'Plan', { icon: 'plan', component: PlanSelectionComponent });
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _viewRegistry.registerRoute({
      path: 'plans',
      resolve: {
        planScreenData: preloadScreenDataResolver('plan'),
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
      },
      canActivate: [
        () => {
          return true;
        },
      ],
      component: SimpleOutletComponent,
      children: [
        {
          path: '',
          redirectTo: 'list',
        },
        {
          path: 'list',
          component: PlanListComponent,
          children: [
            {
              path: 'execute',
              component: SimpleOutletComponent,
              children: [
                dialogRoute({
                  path: ':id',
                  dialogComponent: AltExecutionLaunchDialogComponent,
                  resolve: {
                    repoRef: (route: ActivatedRouteSnapshot) => {
                      const planContextApi = inject(PurePlanContextApiService);
                      const planId = route.params['id'];
                      return planContextApi.createRepositoryObjectReference(planId);
                    },
                  },
                  data: {
                    title: 'Execute Plan',
                  },
                }),
              ],
            },
            schedulePlanRoute(),
            dialogRoute({
              path: 'new',
              dialogComponent: PlanCreateDialogComponent,
            }),
            dialogRoute({
              path: 'import',
              dialogComponent: ImportDialogComponent,
              data: {
                title: 'Plans import',
                entity: 'plans',
                overwrite: false,
                importAll: false,
              },
            }),
            {
              path: 'export',
              component: SimpleOutletComponent,
              children: [
                dialogRoute({
                  path: 'all',
                  dialogComponent: ExportDialogComponent,
                  data: {
                    title: 'Plans export',
                    entity: 'plans',
                    filename: 'allPlans.sta',
                  },
                }),
                dialogRoute({
                  path: ':id',
                  dialogComponent: ExportDialogComponent,
                  resolve: {
                    id: (route: ActivatedRouteSnapshot) => route.params['id'],
                    filename: (route: ActivatedRouteSnapshot) => {
                      const api = inject(AugmentedPlansService);
                      const id = route.params['id'];
                      return api.getPlanById(id).pipe(
                        map((plan) => plan.attributes!['name']),
                        map((name) => `${name}.sta`),
                      );
                    },
                  },
                  data: {
                    title: 'Plans export',
                    entity: 'plans',
                  },
                }),
              ],
            },
          ],
        },
        stepRouteAdditionalConfig(
          {
            quickAccessAlias: 'plansEditor',
            infoBannerKey: 'plansEditor',
          },
          {
            path: 'editor/:id',
            component: PlanEditorComponent,
            providers: [
              {
                provide: PlanContextApiService,
                useExisting: PurePlanContextApiService,
              },
            ],
            canActivate: [
              checkEntityGuardFactory({
                entityType: 'plan',
                getEntity: (id) => inject(AugmentedPlansService).getPlanByIdCached(id),
                getEditorUrl: (id, route) => {
                  const planEditLink = inject(CommonEntitiesUrlsService).planEditorUrl(id);
                  const artefactId = route.queryParams['artefactId'];

                  const editLinkParams = !artefactId
                    ? planEditLink
                    : {
                        url: planEditLink,
                        search: { ['artefactId']: artefactId },
                      };
                  return editLinkParams;
                },
              }),
            ],
            resolve: {
              plan: (route: ActivatedRouteSnapshot) => {
                const id = route.params['id'];
                if (!id) {
                  return undefined;
                }
                return inject(AugmentedPlansService).getPlanByIdCached(id);
              },
            },
            canDeactivate: [
              () => {
                inject(AugmentedPlansService).cleanupCache();
                return true;
              },
            ],
            children: [
              schedulePlanRoute(),
              dialogRoute({
                path: 'launch',
                dialogComponent: AltExecutionLaunchDialogComponent,
                resolve: {
                  repoRef: (route: ActivatedRouteSnapshot) => {
                    const _planContextApi = inject(PlanContextApiService);
                    const planId = route.parent!.params['id'];
                    return _planContextApi.createRepositoryObjectReference(planId);
                  },
                },
                data: {
                  title: 'Execute Plan',
                },
              }),
            ],
          },
        ),
      ],
    });
  }
}
