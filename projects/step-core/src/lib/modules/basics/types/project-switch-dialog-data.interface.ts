import { Project } from './multiple-projects-strategy';

export interface ProjectSwitchDialogData {
  title: string;
  message: string;
  targetProject?: Project;
}
