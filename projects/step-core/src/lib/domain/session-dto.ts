export interface SessionDto {
  otp: boolean;
  username: string;
  role: {
    // looks like separate dto, seems should be moved in future
    attributes: { [key: string]: string };
    name: string;
    customFields: any;
    id: string;
    rights: string[];
    username: string;
  };
}
