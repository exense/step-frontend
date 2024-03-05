import { inject, NgModule } from '@angular/core';
import {
  AugmentedPlansService,
  CustomCellRegistryService,
  dialogRoute,
  EntityRegistry,
  ExportDialogComponent,
  ImportDialogComponent,
  PlanCreateDialogComponent,
  PlanLinkComponent,
  quickAccessRoute,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';
import { PlansBulkOperationsRegisterService } from './injectables/plans-bulk-operations-register.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { planCheckProjectGuard } from './guards/plan-check-project.guard';

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
        quickAccessRoute('plansEditor', {
          path: 'editor/:id',
          component: PlanEditorComponent,
          canActivate: [planCheckProjectGuard],
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
            (_: unknown, route: ActivatedRouteSnapshot) => {
              inject(AugmentedPlansService).cleanupCache();
              return true;
            },
          ],
        }),
      ],
    });
  }
}
