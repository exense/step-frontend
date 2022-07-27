export type ProjectDto = {
  id: string;
  global: boolean;
  customFields: unknown;
  members: unknown;
  attributes: {
    name: string;
    owner: string;
  };
};
