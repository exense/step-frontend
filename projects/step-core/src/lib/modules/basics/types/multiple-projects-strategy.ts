import { Observable, UnaryFunction } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';

export interface Project {
  name?: string;
  global?: boolean;
  projectId?: string;
}

export enum SwitchStatus {
  NONE,
  RUNNING,
}

export type EntityEditLink = string | { url: string; search?: Record<string, any> };

export interface CheckLoadErrorsConfig {
  entityType: string;
  entityId: string;
  routerState?: RouterStateSnapshot;
  getListUrl?: () => string;
  isMatchEditorUrl?: (url: string) => boolean;
}

export interface MultipleProjectsStrategy {
  readonly currentSwitchStatus: SwitchStatus;
  currentProject(): Project | undefined;
  availableProjects(): Project[];
  switchToProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): void;
  getUrlForProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): string;
  getProject(projectId: string): Project | undefined;
  getProject<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined;
  checkLoadErrors<T extends { attributes?: Record<string, string> }>(
    config: CheckLoadErrorsConfig,
  ): UnaryFunction<Observable<T>, Observable<T | string | undefined>>;
  showProjectMessage(message?: { icon: string; message: string }): void;
}
