import { Observable } from 'rxjs';
import { History, Plan, ReportNode, RepositoryObjectReference } from '@exense/step-core';

export abstract class PlanEditorApiService {
  abstract loadPlan(id: string): Observable<Plan>;
  abstract savePlan(plan: Plan): Observable<{ id: string; plan: Plan }>;
  abstract clonePlan(id: string): Observable<Plan>;
  abstract exportPlan(id: string, fileName: string): Observable<void>;

  //???
  abstract getPlanHistory(id: string): Observable<History[]>;
  abstract restorePlanVersion(id: string, versionId: string): Observable<Plan>;

  abstract createRepositoryObjectReference(id: string): RepositoryObjectReference | undefined;
  abstract executeArtefact(sessionId: string, id: string, artefactId: string): Observable<ReportNode>;
  abstract navigateToPlan(id: string): void;
}
