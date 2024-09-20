/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TokenHealth = {
  properties: {
    tokenWrapperOwner: {
      type: 'TokenWrapperOwner',
    },
    errorMessage: {
      type: 'string',
    },
    exception: {
      properties: {
        cause: {
          properties: {
            stackTrace: {
              type: 'array',
              contains: {
                properties: {
                  classLoaderName: {
                    type: 'string',
                  },
                  moduleName: {
                    type: 'string',
                  },
                  moduleVersion: {
                    type: 'string',
                  },
                  methodName: {
                    type: 'string',
                  },
                  fileName: {
                    type: 'string',
                  },
                  lineNumber: {
                    type: 'number',
                    format: 'int32',
                  },
                  nativeMethod: {
                    type: 'boolean',
                  },
                  className: {
                    type: 'string',
                  },
                },
              },
            },
            message: {
              type: 'string',
            },
            localizedMessage: {
              type: 'string',
            },
          },
        },
        stackTrace: {
          type: 'array',
          contains: {
            properties: {
              classLoaderName: {
                type: 'string',
              },
              moduleName: {
                type: 'string',
              },
              moduleVersion: {
                type: 'string',
              },
              methodName: {
                type: 'string',
              },
              fileName: {
                type: 'string',
              },
              lineNumber: {
                type: 'number',
                format: 'int32',
              },
              nativeMethod: {
                type: 'boolean',
              },
              className: {
                type: 'string',
              },
            },
          },
        },
        message: {
          type: 'string',
        },
        suppressed: {
          type: 'array',
          contains: {
            properties: {
              stackTrace: {
                type: 'array',
                contains: {
                  properties: {
                    classLoaderName: {
                      type: 'string',
                    },
                    moduleName: {
                      type: 'string',
                    },
                    moduleVersion: {
                      type: 'string',
                    },
                    methodName: {
                      type: 'string',
                    },
                    fileName: {
                      type: 'string',
                    },
                    lineNumber: {
                      type: 'number',
                      format: 'int32',
                    },
                    nativeMethod: {
                      type: 'boolean',
                    },
                    className: {
                      type: 'string',
                    },
                  },
                },
              },
              message: {
                type: 'string',
              },
              localizedMessage: {
                type: 'string',
              },
            },
          },
        },
        localizedMessage: {
          type: 'string',
        },
      },
    },
  },
} as const;
