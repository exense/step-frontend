import { Observable } from 'rxjs';
import { Plan, ReportNode, RepositoryObjectReference, History } from '../client/step-client-module';

export abstract class PlanEditorApiService {
  abstract loadPlan(id: string): Observable<Plan>;
  abstract savePlan(plan: Plan): Observable<{ id: string; plan: Plan; forceRefresh?: boolean }>;
  abstract renamePlan(plan: Plan, name: string): Observable<{ id: string; plan: Plan }>;
  abstract clonePlan(id: string): Observable<Plan>;
  abstract exportPlan(id: string, fileName: string): Observable<boolean>;
  abstract lookupPlan(id: string, artefactId: string): Observable<Plan>;

  abstract getPlanHistory(id: string): Observable<History[]>;
  abstract restorePlanVersion(id: string, versionId: string): Observable<Plan>;
  abstract getPlanVersion(id: string, plan: Plan): Observable<string>;

  abstract createRepositoryObjectReference(id?: string): RepositoryObjectReference | undefined;
  abstract executeArtefact(sessionId: string, id: string, artefactId: string): Observable<ReportNode>;
  abstract navigateToPlan(id: string, enforcePurePlan?: boolean): void;
}
