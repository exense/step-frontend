export const isResourceId = (id: string): boolean => id.startsWith('resource:');

export const getResourceId = (id: string): string => {
  if (!isResourceId(id)) {
    return id;
  }
  const [prefix, resourceId, revision] = id.split(':');
  return resourceId;
};

export const isApResourceId = (id: string): boolean => id.startsWith('apResource:');

export const extractApId = (id: string): string => {
  if (!isApResourceId(id)) {
    return id;
  }
  const [prefix, apId, path] = id.split(':');
  return apId;
};

export const extractApResourcePath = (id: string): string => {
  if (!isApResourceId(id)) {
    return id;
  }
  const [prefix, apId, path] = id.split(':');
  return path;
};
