import { CustomRegistryItem } from '../../custom-registeries/custom-registries.module';

export interface EntityMeta extends CustomRegistryItem {
  displayName: string;
  entityName: string;
  entityCollectionName?: string;
  getUrl?: string;
  postUrl?: string;
  tableType?: string;
  templateUrl?: string;
  callback?: Function;
  icon?: string;
}
