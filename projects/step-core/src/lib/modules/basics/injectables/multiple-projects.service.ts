import { inject, Injectable, InjectionToken } from '@angular/core';
import { CheckLoadErrorsConfig, MultipleProjectsStrategy, Project } from '../types/multiple-projects-strategy';
import { Observable, pipe, tap, UnaryFunction } from 'rxjs';
import { ErrorMessageHandlerService } from './error-message-handler.service';

const DEFAULT_STRATEGY = new InjectionToken<MultipleProjectsStrategy>('Default multiple project strategy', {
  providedIn: 'root',
  factory: () => {
    const _errorMessageHandler = inject(ErrorMessageHandlerService);
    return {
      showProjectMessage: (message?: { icon: string; message: string }) => {},
      currentProject: () => undefined,
      getProject: <T extends { attributes?: Record<string, string> }>(entityOrProjectId: T | string) => undefined,
      getUrlForProject: (project: Project, navigationParams?: { url: string; search?: Record<string, any> }) => '',
      checkLoadErrors<T extends { attributes?: Record<string, string> }>({
        entityType,
        entityId,
      }: CheckLoadErrorsConfig): UnaryFunction<Observable<T>, Observable<string | T | undefined>> {
        return pipe(
          tap((entity) => {
            if (!entity) {
              _errorMessageHandler.showError(`The ${entityType} with id "${entityId}" doesn't exist`);
            }
          }),
        );
      },
    };
  },
});

@Injectable({
  providedIn: 'root',
})
export class MultipleProjectsService implements MultipleProjectsStrategy {
  private strategy = inject(DEFAULT_STRATEGY);

  currentProject(): Project | undefined {
    return this.strategy.currentProject();
  }

  getProject(projectId: string): Project | undefined;
  getProject<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined;
  getProject<T extends { attributes?: Record<string, string> }>(entityOrProjectId: T | string): Project | undefined {
    if (typeof entityOrProjectId === 'string') {
      const projectId = entityOrProjectId as string;
      return this.strategy.getProject(projectId);
    }
    const entity = entityOrProjectId as T;
    return this.strategy.getProject(entity);
  }

  isEntityBelongsToCurrentProject<T extends { attributes?: Record<string, string> }>(entity: T): boolean {
    const projectId = entity?.attributes?.['project'];
    const currentProjectId = this.currentProject()?.projectId;
    return projectId === currentProjectId;
  }

  isProjectAvailable(projectId: string): boolean;
  isProjectAvailable<T extends { attributes?: Record<string, string> }>(entity: T): boolean;
  isProjectAvailable<T extends { attributes?: Record<string, string> }>(entityOrProjectId: T | string): boolean {
    let project: Project | undefined = undefined;

    if (typeof entityOrProjectId === 'string') {
      project = this.getProject(entityOrProjectId);
    } else {
      project = this.getProject(entityOrProjectId);
    }

    return !!project;
  }

  getUrlForProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): string {
    return this.strategy.getUrlForProject(project, navigationParams);
  }

  checkLoadErrors<
    T extends {
      attributes?: Record<string, string>;
    },
  >(config: CheckLoadErrorsConfig): UnaryFunction<Observable<T>, Observable<string | T | undefined>> {
    return this.strategy.checkLoadErrors(config);
  }

  showProjectMessage(message?: { icon: string; message: string }): void {
    this.strategy.showProjectMessage(message);
  }

  cleanupProjectMessage(): void {
    this.strategy.showProjectMessage(undefined);
  }

  useStrategy(strategy: MultipleProjectsStrategy): void {
    this.strategy = strategy;
  }
}
