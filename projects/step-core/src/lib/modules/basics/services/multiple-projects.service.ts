import { Injectable } from '@angular/core';
import { MultipleProjectsStrategy, Project } from '../shared/multiple-projects-strategy';

const DEFAULT_STRATEGY: MultipleProjectsStrategy = {
  availableProjects: () => [],
  currentProject: () => undefined,
  getEntityProject: <T extends { attributes?: Record<string, string> }>(entity: T) => undefined,
  switchToProject: (project: Project, navigateToUrl?: string) => {},
};

@Injectable({
  providedIn: 'root',
})
export class MultipleProjectsService implements MultipleProjectsStrategy {
  private strategy = DEFAULT_STRATEGY;

  availableProjects(): Project[] {
    return this.strategy.availableProjects();
  }

  currentProject(): Project | undefined {
    return this.strategy.currentProject();
  }

  getEntityProject<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined {
    return this.strategy.getEntityProject(entity);
  }

  isEntityBelongsToCurrentProject<T extends { attributes?: Record<string, string> }>(entity: T): boolean {
    const projectId = entity?.attributes?.['project'];
    const currentProjectId = this.currentProject()?.projectId;
    return projectId === currentProjectId;
  }

  switchToProject(project: Project, navigateToUrl?: string): void {
    this.strategy.switchToProject(project, navigateToUrl);
  }

  useStrategy(strategy: MultipleProjectsStrategy): void {
    this.strategy = strategy;
  }
}
