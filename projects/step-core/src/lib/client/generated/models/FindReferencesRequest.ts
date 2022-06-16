/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FindReferencesRequest = {
    searchType?: 'PLAN_ID' | 'PLAN_NAME' | 'KEYWORD_ID' | 'KEYWORD_NAME' | 'RESOURCE_ID' | 'RESOURCE_NAME';
    searchValue?: string;
    includeHiddenPlans?: boolean;
};

