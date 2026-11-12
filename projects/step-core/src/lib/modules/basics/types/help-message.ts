export interface HelpMessage {
  /** Trusted application markup, rendered without sanitizing. It must never contain user data or a link. */
  html: string;
  learnMoreUrl?: string;
}
