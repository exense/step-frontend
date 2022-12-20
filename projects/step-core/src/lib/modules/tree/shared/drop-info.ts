import { DropType } from './drop-type.enum';

export interface DropInfo {
  dragNodeId: string;
  dropNodeId: string;
  height: number;
  dropType: DropType;
  canInsert: boolean;
}
