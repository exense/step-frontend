/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TokenWrapperOwner } from './TokenWrapperOwner';

export type TokenHealth = {
  tokenWrapperOwner?: TokenWrapperOwner;
  errorMessage?: string;
  exception?: {
    cause?: {
      stackTrace?: Array<{
        classLoaderName?: string;
        moduleName?: string;
        moduleVersion?: string;
        methodName?: string;
        fileName?: string;
        lineNumber?: number;
        nativeMethod?: boolean;
        className?: string;
      }>;
      message?: string;
      localizedMessage?: string;
    };
    stackTrace?: Array<{
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      lineNumber?: number;
      nativeMethod?: boolean;
      className?: string;
    }>;
    message?: string;
    suppressed?: Array<{
      stackTrace?: Array<{
        classLoaderName?: string;
        moduleName?: string;
        moduleVersion?: string;
        methodName?: string;
        fileName?: string;
        lineNumber?: number;
        nativeMethod?: boolean;
        className?: string;
      }>;
      message?: string;
      localizedMessage?: string;
    }>;
    localizedMessage?: string;
  };
};
