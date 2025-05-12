export enum CustomRegistryType {
  ENTITY = 'entity',
  ENTITY_BULK_OPERATIONS = 'entityBulkOperations',
  ENTITY_MENU_ITEMS = 'entityMenuItems',
  PLAN_TYPE = 'planType',
  FUNCTION_TYPE = 'functionType',
  FUNCTION_PACKAGE_TYPE = 'functionPackageType',
  CUSTOM_CELL = 'customCell',
  CUSTOM_SEARCH_CELL = 'customSearchCell',
  DASHLET = 'dashlet', // this is a temporary type, while we have to use an old router

  EXECUTION_CUSTOM_PANEL = 'executionCustomPanel',
  ARTEFACT = 'artefact',
  WIZARD_STEP = 'wizardStep',
  AUTOMATION_PACKAGE_ENTITY_TABLE = 'automationPackageEntityTable',
}
