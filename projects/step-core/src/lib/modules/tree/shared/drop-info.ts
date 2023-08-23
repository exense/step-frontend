import { DropType } from './drop-type.enum';

export interface DropInfo {
  dragNodeId: string;
  dropType: DropType;
  canInsert: boolean;
  parentNodeId: string;
  siblingNodeId?: string;
}
