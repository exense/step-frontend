export interface Project {
  name?: string;
  global?: boolean;
  projectId?: string;
}

export enum SwitchStatus {
  NONE,
  RUNNING,
}

export interface MultipleProjectsStrategy {
  readonly currentSwitchStatus: SwitchStatus;
  currentProject(): Project | undefined;
  availableProjects(): Project[];
  switchToProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): void;
  getEntityProject<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined;
}
