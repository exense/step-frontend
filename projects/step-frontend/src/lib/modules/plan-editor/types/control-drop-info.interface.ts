import { ControlType } from './control-type.enum';

export interface ControlDropInfo {
  type: ControlType;
  id: string;
  label: string;
  icon: string;
}
