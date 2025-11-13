export const isResourceId = (id: string) => id.startsWith('resource:');

export const getResourceId = (id: string) => {
  if (!isResourceId(id)) {
    return id;
  }
  const [prefix, resourceId, revision] = id.split(':');
  return resourceId;
};
