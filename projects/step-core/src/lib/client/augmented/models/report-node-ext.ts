import { ReportNode } from '../../generated';

interface ReportNodeAddon {
  functionAttributes?: Record<string, string>;
  input?: string | null;
  output?: string | null;
  echo?: string;
  message?: string;
  key?: string;
  value?: string;
  agentUrl?: string;
}

export type ReportNodeExt = ReportNode & ReportNodeAddon;
