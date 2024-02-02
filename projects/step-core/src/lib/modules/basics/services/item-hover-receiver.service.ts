export abstract class ItemHoverReceiverService {
  abstract receiveHoveredItem(item: unknown | undefined): void;
}
