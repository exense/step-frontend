import { UserPreferencesDto } from './user-preferences-dto';

export interface UserDto {
  id: string;
  username: string;
  password: string;
  role: string;
  customFields?: unknown;
  preferences?: UserPreferencesDto;
}
