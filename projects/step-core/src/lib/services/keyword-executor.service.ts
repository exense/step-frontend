import { inject, Injectable } from '@angular/core';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { ArtefactsFactoryService } from '../modules/artefacts-common/injectables/artefacts-factory.service';
import { PlanOpenService } from '../modules/plan-common';
import { AugmentedPlansService } from '../client/step-client-module';

const PLAN_TYPE = 'step.core.plans.Plan';
const PLAN_TEMPLATE = 'Session';

@Injectable({
  providedIn: 'root',
})
export class KeywordExecutorService {
  private _planApi = inject(AugmentedPlansService);
  private _artefactsFactory = inject(ArtefactsFactoryService);
  private _planOpen = inject(PlanOpenService);

  executeKeyword(keywordId: string): void {
    const plan$ = this._planApi.newPlan(PLAN_TYPE, PLAN_TEMPLATE).pipe(
      tap((createdPlan) => {
        createdPlan!.attributes = createdPlan!.attributes ?? {};
        createdPlan!.attributes!['name'] = PLAN_TEMPLATE;
        createdPlan!.visible = false;
      }),
    );

    const keywordArtefact$ = this._artefactsFactory.createCallKeywordArtefact(keywordId);

    forkJoin([plan$, keywordArtefact$])
      .pipe(
        map(([plan, keywordArtefact]) => {
          plan!.root!.children = [keywordArtefact];
          return plan;
        }),
        switchMap((plan) => this._planApi.savePlan(plan)),
      )
      .subscribe((plan) => {
        const artefactId = plan!.root!.children![0]!.id;
        this._planOpen.open(plan.id!, { artefactId, startInteractive: true });
      });
  }
}
