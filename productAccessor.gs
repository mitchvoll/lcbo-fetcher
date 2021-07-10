class ProductAccessor {
  constructor(range, sheetRowNumber) {
    this.range = range;
    this.sheetRowNumber = sheetRowNumber;

    this.name = this.attribute(COLUMNS.PRODUCT_NAME).getValue();
    this.url = range.getCell(sheetRowNumber, COLUMNS.URL).getValue();
  }

  attribute(cellName) {
    return this.range.getCell(this.sheetRowNumber, cellName);
  }
  setAttribute(attribute, value) {
    this.attribute(attribute).setValue(value)
  }
  setAttributes(setterObj) {
    Object.entries(setterObj).forEach(([key, value]) => this.setAttribute(key, value));
  }
  markLinkInvalid() {
    this.attribute(COLUMNS.VALID_URL).setValue(false);
  }

  isAvailableInStore() {
    return this.attribute(COLUMNS.AVAILABLE_IN_STORE).getValue() === 'available';
  }
  isAvailableForDelivery() {
    return this.attribute(COLUMNS.AVAILABLE_FOR_DELIVERY).getValue() === 'available';
  }
  isLinkValid() {
    return this.attribute(COLUMNS.VALID_URL).getValue() !== false;
  }
}
