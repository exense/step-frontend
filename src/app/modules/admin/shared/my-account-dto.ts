import { MyAccountPreferencesDto } from './my-account-preferences-dto';

export interface MyAccountDto {
  id: string;
  username: string;
  password: string;
  role: string;
  customFields: unknown;
  preferences: MyAccountPreferencesDto;
}
