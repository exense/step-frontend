import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import {
  AbstractArtefact,
  AugmentedPlansService,
  AugmentedScreenService,
  DynamicValueString,
  KeywordsService,
} from '../client/step-client-module';
import { DynamicFieldsSchema } from '../modules/dynamic-forms/shared/dynamic-fields-schema';
import { AuthService } from '../modules/auth';

@Injectable({
  providedIn: 'root',
})
export class ArtefactsFactoryService {
  private _planApi = inject(AugmentedPlansService);
  private _keywordCallsApi = inject(KeywordsService);
  private _screenTemplates = inject(AugmentedScreenService);
  private _authService = inject(AuthService);

  createControlArtefact(artefactTypeId: string): Observable<AbstractArtefact> {
    return this._planApi.getArtefactType(artefactTypeId).pipe(
      map((artefact) => {
        artefact!.dynamicName!.dynamic = artefact!.useDynamicName;
        return artefact;
      }),
    );
  }

  createCallKeywordArtefact(keywordId: string): Observable<AbstractArtefact> {
    return this._keywordCallsApi.getFunctionById(keywordId).pipe(
      switchMap((keyword) => {
        const artefact$ = this._planApi.getArtefactType('CallKeyword');
        return artefact$.pipe(
          map((artefact) => {
            artefact!.attributes!['name'] = keyword!.attributes!['name'];
            artefact!.dynamicName!.dynamic = artefact.useDynamicName;
            return { artefact, keyword };
          }),
        );
      }),
      switchMap(({ artefact, keyword }) => {
        const inputs$ = this._screenTemplates.getInputsForScreenPost('functionTable');
        return inputs$.pipe(
          map((inputs) => {
            const functionAttributes = inputs.reduce(
              (res, input) => {
                const attributeId = (input?.id || '').replace('attributes.', '');
                if (!attributeId || !keyword?.attributes?.[attributeId]) {
                  return res;
                }
                const dynamic = false;
                const value = keyword.attributes[attributeId];
                res[attributeId] = { value, dynamic };
                return res;
              },
              {} as Record<string, { value: string; dynamic: boolean }>,
            );

            (artefact as any)['function'] = { value: JSON.stringify(functionAttributes), dynamic: false };
            return { artefact, keyword };
          }),
        );
      }),
      map(({ artefact, keyword }) => {
        if (this._authService.getConf()?.miscParams?.['enforceschemas'] !== 'true') {
          return artefact;
        }

        const schema = keyword?.schema as unknown as DynamicFieldsSchema | undefined;
        if (!schema?.properties) {
          return artefact;
        }

        const targetObject = (schema?.required || []).reduce(
          (res, field) => {
            const property = schema?.properties[field];
            if (!property) {
              return res;
            }

            const value = property.default;
            res[field] = { value, dynamic: false };
            return res;
          },
          {} as Record<string, DynamicValueString>,
        );

        (artefact as any)['argument'] = {
          dynamic: false,
          value: JSON.stringify(targetObject),
          expression: null,
          expressionType: null,
        };

        return artefact;
      }),
    );
  }

  createCallPlanArtefact(planId: string): Observable<AbstractArtefact> {
    return this._planApi.getPlanById(planId).pipe(
      switchMap((plan) => {
        const artefact$ = this._planApi.getArtefactType('CallPlan');
        return artefact$.pipe(
          map((artefact) => {
            artefact.attributes!['name'] = plan.attributes!['name'];
            (artefact as any)['planId'] = planId;
            artefact.dynamicName!.dynamic = artefact.useDynamicName;
            return artefact;
          }),
        );
      }),
    );
  }
}
