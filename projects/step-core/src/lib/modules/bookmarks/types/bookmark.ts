export type Bookmark = {
  id?: string;
  label?: string;
  page?: string;
  link?: string;
  tenant?: string;
  icon?: string;
  customFields?: {
    icon?: string;
    label?: string;
    link?: string;
    page?: string;
    tenant?: string;
  };
};
