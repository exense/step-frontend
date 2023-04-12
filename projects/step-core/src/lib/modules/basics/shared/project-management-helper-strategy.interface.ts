import { ProjectInfo } from './project-info.interface';

export interface ProjectManagementHelperStrategy {
  getCurrentProject(): ProjectInfo | undefined;
  getProjectById(projectId: string): ProjectInfo | undefined;
}
