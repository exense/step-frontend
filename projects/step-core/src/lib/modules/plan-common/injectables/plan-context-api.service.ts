import { Observable } from 'rxjs';
import { Plan, ReportNode, RepositoryObjectReference, History } from '../../../client/step-client-module';
import { PlanContext } from '../types/plan-context.interface';

export abstract class PlanContextApiService {
  abstract loadPlan(id: string): Observable<PlanContext>;
  abstract savePlan(context: PlanContext): Observable<PlanContext & { forceRefresh?: boolean }>;
  abstract renamePlan(context: PlanContext, name: string): Observable<PlanContext>;
  abstract clonePlan(id: string): Observable<PlanContext>;
  abstract exportPlan(id: string, fileName: string): Observable<boolean>;

  abstract getPlanHistory(id: string): Observable<History[]>;
  abstract restorePlanVersion(id: string, versionId: string): Observable<PlanContext>;
  abstract getPlanVersion(id: string, context: PlanContext): Observable<string>;

  abstract createRepositoryObjectReference(id?: string): RepositoryObjectReference | undefined;
  abstract executeArtefact(sessionId: string, id: string, artefactId: string): Observable<ReportNode>;
  abstract navigateToPlan(id: string, enforcePurePlan?: boolean): void;
  abstract createContextDuplicate(context: PlanContext): PlanContext;
}
