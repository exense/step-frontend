export const AP_ENTITY_ID = 'automationPackages';
export const PATH = 'automation-package';
export const EDITOR_PATH = `/automation-package/list/upload`;
export const REGEX_EDITOR = /\/automation-package\/list\/upload\/(?:\d|\w){24}/;
export const AP_LABEL_ENTITY = 'Automation Package';
export const LABEL_MENU = 'Automation Packages';
export const AP_ICON = 'automation';
export const AP_RESOURCE_ENTITY_ID = 'automationPackageResources';
export const AP_RESOURCE_LABEL_ENTITY = "Automation Package's Resource";
export const AP_RESOURCE_ICON = 'file-attachment-03';
export const AP_RESOURCE_FILTER =
  'not(resourceType=attachment) and (resourceType=automationPackage or resourceType=automationPackageLibrary)';
