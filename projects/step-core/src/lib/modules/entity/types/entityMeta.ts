export type EntityMeta = {
  displayName: string;
  entityName: string;
  entityCollectionName: string;
  getUrl: string;
  postUrl: string;
  tableType: string;
  templateUrl: string;
  callback: Function;
  icon: string;
  iconAG2: string; //FIXME: rename / replace to icon when fully switching this to AG2
};
