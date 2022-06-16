/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileVersionId } from './FileVersionId';

export type FileVersion = {
    file?: Blob;
    versionId?: FileVersionId;
    directory?: boolean;
};

