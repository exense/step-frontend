export const RESOURCE_FILTER = [
  'attachment',
  'automationPackage',
  'automationPackageLibrary',
  'automationPackageManagedLibrary',
]
  .map((resourceType) => `not(resourceType=${resourceType})`)
  .join(' and ');
