import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MultipleProjectsStrategy, Project } from '../shared/multiple-projects-strategy';
import { ProjectSwitchDialogComponent } from '../components/project-switch-dialog/project-switch-dialog.component';
import { ProjectSwitchDialogData } from '../shared/project-switch-dialog-data.interface';
import { ProjectSwitchDialogResult } from '../shared/project-switch-dialog-result.enum';
import { filter, map, Observable, of } from 'rxjs';

const DEFAULT_STRATEGY: MultipleProjectsStrategy = {
  availableProjects: () => [],
  currentProject: () => undefined,
  getEntityProject: <T extends { attributes?: Record<string, string> }>(entity: T) => undefined,
  switchToProject: (project: Project, navigationParams?: { url: string; search: Record<string, any> }) => {},
};

@Injectable({
  providedIn: 'root',
})
export class MultipleProjectsService implements MultipleProjectsStrategy {
  private _matDialog = inject(MatDialog);

  private strategy = DEFAULT_STRATEGY;

  availableProjects(): Project[] {
    return this.strategy.availableProjects();
  }

  currentProject(): Project | undefined {
    return this.strategy.currentProject();
  }

  getProjectById(id: string): Project | undefined {
    return this.availableProjects().find((project) => project.projectId === id);
  }

  getEntityProject<T extends { attributes?: Record<string, string> }>(entity: T): Project | undefined {
    return this.strategy.getEntityProject(entity);
  }

  isEntityBelongsToCurrentProject<T extends { attributes?: Record<string, string> }>(entity: T): boolean {
    const projectId = entity?.attributes?.['project'];
    const currentProjectId = this.currentProject()?.projectId;
    return projectId === currentProjectId;
  }

  switchToProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): void {
    this.strategy.switchToProject(project, navigationParams);
  }

  confirmEntityEditInASeparateProject<T extends { attributes?: Record<string, string> }>(
    entity: T,
    entityEditLink: string | { url: string; search?: Record<string, any> },
    entityType: string = 'entity'
  ): Observable<boolean> {
    const targetProject = this.getEntityProject(entity);
    if (!targetProject) {
      console.error(`Project not found for ${entityType}`, entity);
      return of(false);
    }

    const title = `Selected ${entityType} belongs to the project "${targetProject?.name}", do you want to switch?`;

    return this._matDialog
      .open<ProjectSwitchDialogComponent, ProjectSwitchDialogData, ProjectSwitchDialogResult>(
        ProjectSwitchDialogComponent,
        {
          data: {
            title,
            targetProject,
          },
          width: '80rem',
        }
      )
      .afterClosed()
      .pipe(
        filter((result) => {
          if (result === ProjectSwitchDialogResult.OPEN_IN_TARGET) {
            const editParams = typeof entityEditLink === 'string' ? { url: entityEditLink } : entityEditLink;
            this.switchToProject(targetProject, editParams);
            return false;
          }
          return true;
        }),
        map((result) => result === ProjectSwitchDialogResult.OPEN_IN_CURRENT)
      );
  }

  useStrategy(strategy: MultipleProjectsStrategy): void {
    this.strategy = strategy;
  }
}
