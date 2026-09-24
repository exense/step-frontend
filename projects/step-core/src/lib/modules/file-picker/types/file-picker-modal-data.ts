import { SelectionMode } from './selection-mode.enum';

export interface FilePickerModalData {
  initialDirectory?: string;
  title: string;
  withName?: boolean;
  createFolder?: boolean;
  selectionMode?: SelectionMode;
}
