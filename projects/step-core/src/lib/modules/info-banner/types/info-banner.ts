export interface InfoBanner {
  id: string;
  info: string;
  options?: { hasPermission?: string; hasNotPermission?: string };
}
