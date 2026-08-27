import { Injectable, signal } from '@angular/core';

export interface ProjectScopeWarning {
  icon: string;
  message: string;
  action?: {
    url: string;
    label: string;
  };
}

@Injectable()
export class ProjectScopeWarningService {
  private readonly warningInternal = signal<ProjectScopeWarning | undefined>(undefined);
  readonly warning = this.warningInternal.asReadonly();

  show(warning: ProjectScopeWarning): void {
    this.warningInternal.set(warning);
  }

  clear(): void {
    this.warningInternal.set(undefined);
  }
}
