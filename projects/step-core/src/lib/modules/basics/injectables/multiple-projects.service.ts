import { inject, Injectable, InjectionToken } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CheckLoadErrorsConfig,
  EntityEditLink,
  MultipleProjectsStrategy,
  Project,
  SwitchStatus,
} from '../types/multiple-projects-strategy';
import { ProjectSwitchDialogComponent } from '../components/project-switch-dialog/project-switch-dialog.component';
import { ProjectSwitchDialogData } from '../types/project-switch-dialog-data.interface';
import { ProjectSwitchDialogResult } from '../types/project-switch-dialog-result.enum';
import { filter, map, Observable, of, pipe, tap, UnaryFunction } from 'rxjs';
import { ErrorMessageHandlerService } from './error-message-handler.service';

const DEFAULT_STRATEGY = new InjectionToken<MultipleProjectsStrategy>('Default multiple project strategy', {
  providedIn: 'root',
  factory: () => {
    const _errorMessageHandler = inject(ErrorMessageHandlerService);
    return {
      get currentSwitchStatus() {
        return SwitchStatus.NONE;
      },
      showProjectMessage: (message?: { icon: string; message: string }) => {},
      availableProjects: () => [],
      currentProject: () => undefined,
      getProject: <T extends { attributes?: Record<string, string> }>(entityOrProjectId: T | string) => undefined,
      switchToProject: (project: Project, navigationParams?: { url: string; search: Record<string, any> }) => {},
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
  private _matDialog = inject(MatDialog);

  private strategy = inject(DEFAULT_STRATEGY);

  get currentSwitchStatus(): SwitchStatus {
    return this.strategy.currentSwitchStatus;
  }

  availableProjects(): Project[] {
    return this.strategy.availableProjects();
  }

  currentProject(): Project | undefined {
    return this.strategy.currentProject();
  }

  getProjectById(id: string): Project | undefined {
    return this.availableProjects().find((project) => project.projectId === id);
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

  switchToProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): void {
    this.strategy.switchToProject(project, navigationParams);
  }

  getUrlForProject(project: Project, navigationParams?: { url: string; search?: Record<string, any> }): string {
    return this.strategy.getUrlForProject(project, navigationParams);
  }

  confirmEntityEditInASeparateProject<T extends { attributes?: Record<string, string> }>(params: {
    entity?: T;
    targetProjectId?: string;
    entityEditLink: EntityEditLink;
    entityType?: string;
    allowToOpenInCurrentProject?: boolean;
  }): Observable<boolean> {
    if (this.currentSwitchStatus === SwitchStatus.RUNNING) {
      return of(true);
    }

    const { entity, targetProjectId, entityEditLink } = params;
    let { entityType, allowToOpenInCurrentProject } = params;
    entityType = entityType ?? 'entity';
    allowToOpenInCurrentProject = allowToOpenInCurrentProject ?? true;

    let targetProject: Project | undefined = undefined;
    if (!!entity) {
      targetProject = this.getProject(entity);
    } else if (!!targetProjectId) {
      targetProject = this.getProjectById(targetProjectId);
    }

    const title = !!targetProject ? 'Switch to another project' : `Open ${entityType} in current project`;

    const message = !!targetProject
      ? `Selected ${entityType} belongs to the project "${targetProject?.name}", do you want to switch?`
      : `Selected ${entityType} belongs to another global project, which you don't have access to. Do you want to open it in current project?`;

    return this._matDialog
      .open<ProjectSwitchDialogComponent, ProjectSwitchDialogData, ProjectSwitchDialogResult>(
        ProjectSwitchDialogComponent,
        {
          data: {
            title,
            message,
            targetProject,
            allowToOpenInCurrentProject,
          },
          width: '80rem',
        },
      )
      .afterClosed()
      .pipe(
        filter((result) => {
          if (result === ProjectSwitchDialogResult.OPEN_IN_TARGET && targetProject) {
            const editParams = typeof entityEditLink === 'string' ? { url: entityEditLink } : entityEditLink;
            this.switchToProject(targetProject, editParams);
            return false;
          }
          return true;
        }),
        map((result) => result === ProjectSwitchDialogResult.OPEN_IN_CURRENT),
      );
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
