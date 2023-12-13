export abstract class ItemHoldReceiverService {
  abstract receiveHoldItem(item: unknown | undefined): void;
}
