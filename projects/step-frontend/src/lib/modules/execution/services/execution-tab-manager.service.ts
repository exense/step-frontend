export abstract class ExecutionTabManagerService {
  abstract handleTabClose(tabId: string, openList?: boolean): void;
}
