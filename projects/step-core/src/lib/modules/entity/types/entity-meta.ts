import { CustomRegistryItem } from '../../custom-registeries/custom-registries.module';

export interface EntityMeta extends CustomRegistryItem {
  displayName: string;
  entityName: string;
  entityCollectionName: string | null;
  getUrl: string | null;
  postUrl: string | null;
  tableType: string | null;
  templateUrl: string | null;
  callback: Function | null;
  icon: string | null;
  iconAG2?: string | null; //FIXME: rename / replace to icon when fully switching this to AG2
}
