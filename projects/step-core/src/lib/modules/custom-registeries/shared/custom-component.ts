export interface CustomComponent {
  context?: any;
  contextChange?(previousContext?: any, currentContext?: any): void;
}
