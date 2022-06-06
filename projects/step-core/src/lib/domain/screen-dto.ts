import { ScreenInputDto } from './screen-input-dto';

export interface ScreenDto {
  customFields?: { [key: string]: { [key: string]: unknown } };
  attributes?: { [key: string]: string };
  screenId?: string;
  position?: number;
  input?: ScreenInputDto;
  id?: string;
}
