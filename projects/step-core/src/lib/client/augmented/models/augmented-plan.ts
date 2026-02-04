import {
  AgentProvisioningConfiguration,
  Plan,
  AutomaticAgentProvisioningConfiguration,
  ManualAgentProvisioningConfiguration,
} from '../../generated';

type AugmentedAgents = {
  agents?:
    | AgentProvisioningConfiguration
    | AutomaticAgentProvisioningConfiguration
    | ManualAgentProvisioningConfiguration;
};

export type AugmentedPlan = AugmentedAgents & Plan;
