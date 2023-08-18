export interface TreeNode {
  id: string;
  name: string;
  parentId?: string;
  icon: string;
  iconClassName?: string;
  expandable: boolean;
  isSkipped: boolean;
  isVisuallySkipped?: boolean;
  children?: TreeNode[];
}
