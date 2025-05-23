import { ExecutionUrlPipe } from './pipes/execution-url.pipe';
import { ExecutionNamePipe } from './pipes/execution-name.pipe';

export * from './injectables/execution-params-factory.service';
export * from './injectables/execution-view-mode.token';
export * from './types/include-testcases.interface';
export * from './types/execution-params-config';
export * from './types/execution-view-mode';
export * from './pipes/execution-url.pipe';
export * from './pipes/execution-name.pipe';

export const EXECUTION_COMMON_EXPORTS = [ExecutionUrlPipe, ExecutionNamePipe];
