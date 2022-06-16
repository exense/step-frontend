/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ReportNode = {
    properties: {
        customFields: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        parentID: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
        name: {
            type: 'string',
        },
        executionID: {
            type: 'string',
        },
        artefactID: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
        executionTime: {
            type: 'number',
            format: 'int64',
        },
        duration: {
            type: 'number',
            format: 'int32',
        },
        attachments: {
            type: 'array',
            contains: {
                type: 'AttachmentMeta',
            },
        },
        status: {
            type: 'Enum',
        },
        error: {
            type: 'Error',
        },
        customAttributes: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        resolvedArtefact: {
            type: 'AbstractArtefact',
        },
        orphan: {
            type: 'boolean',
        },
        id: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
        _class: {
            type: 'string',
            isRequired: true,
        },
    },
} as const;
