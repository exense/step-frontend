import { ProjectManagementHelperStrategy } from '../shared/project-management-helper-strategy.interface';
import { ProjectInfo } from '../shared/project-info.interface';
import { Injectable } from '@angular/core';

const DEFAULT_PROJECT_MANAGEMENT_HELPER_STRATEGY: ProjectManagementHelperStrategy = {
  getCurrentProject: () => undefined,
  getProjectById: (projectId: string) => undefined,
};

@Injectable({
  providedIn: 'root',
})
export class ProjectManagementHelperService implements ProjectManagementHelperStrategy {
  private strategy: ProjectManagementHelperStrategy = DEFAULT_PROJECT_MANAGEMENT_HELPER_STRATEGY;

  useStrategy(strategy: ProjectManagementHelperStrategy): void {
    this.strategy = strategy;
  }

  getCurrentProject(): ProjectInfo | undefined {
    return this.strategy.getCurrentProject();
  }

  getProjectById(projectId: string): ProjectInfo | undefined {
    return this.strategy.getProjectById(projectId);
  }
}
