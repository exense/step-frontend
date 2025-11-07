export const AP_ENTITY_ID = 'automationPackages';
export const AP_LIST_PATH = '/automation-package/list';
export const EDITOR_PATH = `/automation-package/list/upload`;
export const REGEX_EDITOR = /\/automation-package\/list\/upload\/(?:\d|\w){24}/;
export const AP_LABEL_ENTITY = 'Automation Package';
export const LABEL_MENU = 'Automation Packages';
export const AP_ICON = 'automation';
export const AP_RESOURCE_LIBRARY_ENTITY_ID = 'automationPackageLibrary';
export const AP_RESOURCE_LIBRARY_LABEL_ENTITY = "Automation Package's Library";
export const AP_RESOURCE_ICON = 'file-attachment-03';
export const AP_RESOURCE_FILTER =
  'not(resourceType=attachment) and (resourceType=automationPackage or resourceType=automationPackageLibrary)';
export const AP_RESOURCE_LIBRARY_FILTER =
  'not(resourceType=attachment) and (resourceType=automationPackageLibrary or resourceType=automationPackageManagedLibrary)';
export const AP_RESOURCE_LIBRARY_LIST_PATH = `/automation-package/libraries`;
export const AP_RESOURCE_LIBRARY_EDITOR_PATH = `${AP_RESOURCE_LIBRARY_LIST_PATH}/upload`;
export const AP_RESOURCE_LIBRARY_REGEX_EDITOR = /\/automation-package\/libraries\/upload\/(?:\d|\w){24}/;
