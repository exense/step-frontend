import { TokenWrapperOwner } from '../../generated';

export type AugmentedTokenWrapperOwner = TokenWrapperOwner & {
  executionDescription: string;
  exeuctionId: string;
  ipAddress: string;
  username: string;
};
