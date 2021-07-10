const COLUMNS = { URL: 1, PRODUCT_NAME: 2, AVAILABLE_TO_SHIP: 3, AVAILABLE_IN_STORE: 4 };
const AVAILABILITY_MAP = {
  '(Limited QTY)': 'limited',
  '(Unavailable)': 'unavailable',
  '(Available)': 'available',
}
const PRIMARY_EMAIL = 'email@example.com';
const CC_EMAILS = 'cc_email@example.com';
const COOKIES = {
  "WC_physicalCity": "TORONTO-CENTRAL",
  "WC_physicalStores": "715841646",
  "WC_stCity": "m4t2y4",
  "lang": "en",
  "languagepopupshown": "true",
  "storetype": "clickcollect",
};


function sendNowAvailableForProducts(products) {
  if (!products.length) return;

  const message = products.map(product => {
    return `${product.name} is now available`;
  }).join('\n\n');

  MailApp.sendEmail(PRIMARY_EMAIL, 'LCBO fetcher update', message, { cc: CC_EMAILS });
}

function sendBrokenLinkDetected(productName) {
  const message = `${productName} link no longer works. Script will skip updating for now but this should be removed or fixed`;
  MailApp.sendEmail(PRIMARY_EMAIL, 'LCBO fetcher bad link', message, { cc: CC_EMAILS});
}

function main() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const newlyAvailableProducts = [];
  
  for (let i = 2; i < range.getNumRows() + 1; i++) {
    const product = new ProductAccessor(range, i);
    const cheerio = new CheerioAccessor(product.url);

    if (!cheerio.isValid()) {
      sendBrokenLinkDetected(product.productName);
      continue
    }
    
    if (!product.isAvailableInStore() && cheerio.isAvailableInStore()) {
      newlyAvailableProducts.push(product);
    }
    else if (!product.isAvailableForDelivery() && cheerio.isAvailableForDelivery()) {
      newlyAvailableProducts.push(product);
    }

    product.setAttributes({
      'PRODUCT_NAME': cheerio.productName,
      'AVAILABLE_IN_STORE': cheerio.productAvailabilityToStore,
      'AVAILABLE_TO_SHIP': cheerio.productAvailabilityDelivery,
    });
  };

  sendNowAvailableForProducts(newlyAvailableProducts);
}

class CheerioAccessor {
  constructor(url) {
    this.url = url;

    this.cheerio = this.cheerioFromUrl(url);
  }

  cheerioFromUrl(url) {
    const cookie = Object.entries(COOKIES).map(pair => pair.join('=')).join('; ');
    const html = UrlFetchApp.fetch(url, { "headers": { "cookie": cookie, "cache-control": "no-cache" }}).getContentText();
    return Cheerio.load(html);
  }

  isValid() {
    try {
      if(this.productName && this.productAvailabilityDelivery && this.productAvailabilityToStore) {
        return true;
      }
    }
    catch(e) {
      return false;
    }
  }

  isAvailableInStore() {
    return this.productAvailabilityToStore === 'available';
  }
  isAvailableForDelivery() {
    return this.isAvailableForDelivery === 'available';
  }

  get productName() {
    if (this._productName_) return this._productName_;

    return this._productName_ = this.cheerio('title').text().split('|')[0];
  }

  get productAvailabilityDelivery() {
    if (this._productAvailabilityDelivery_) return this._productAvailabilityDelivery_;

    const raw = this.cheerio('.inventoryOption').first().text().split('\n')[2].trim();
    return this._productAvailabilityDelivery_ = AVAILABILITY_MAP[raw] || raw;
  }

  get productAvailabilityToStore() {
    if (this._productAvailabilityToStore_) return this._productAvailabilityToStore_;

    const raw = this.cheerio('.inventoryOption').last().text().split('\n')[2].trim();
    return this._productAvailabilityToStore_ = AVAILABILITY_MAP[raw] || raw;
  }
}

class ProductAccessor {
  constructor(range, sheetRowNumber) {
    this.range = range;
    this.sheetRowNumber = sheetRowNumber;

    this.name = this.productNameCell.getValue();
    this.url = range.getCell(sheetRowNumber, COLUMNS.URL).getValue();
  }

  get productNameCell() {
    return this.range.getCell(this.sheetRowNumber, COLUMNS.PRODUCT_NAME);
  }
  get inStoreAvailableCell() {
    return this.range.getCell(this.sheetRowNumber, COLUMNS.AVAILABLE_IN_STORE);
  }
  get deliveryAvailableCell() {
    return this.range.getCell(this.sheetRowNumber, COLUMNS.AVAILABLE_TO_SHIP);
  }

  get productName() {
    return this.productNameCell.getValue();
  }
  isAvailableInStore() {
    return this.inStoreAvailableCell.getValue() === 'available';
  }
  isAvailableForDelivery() {
    return this.deliveryAvailableCell.getValue() === 'available';
  }

  setAttribute(attribute, value) {
    if (attribute == 'PRODUCT_NAME') {
      this.productNameCell.setValue(value)
    }
    if (attribute == 'AVAILABLE_IN_STORE') {
      this.inStoreAvailableCell.setValue(value)
    }
    if (attribute == 'AVAILABLE_TO_SHIP') {
      this.deliveryAvailableCell.setValue(value)
    }
  }
  setAttributes(setterObj) {
    Object.entries(setterObj).forEach(([key, value]) => this.setAttribute(key, value));
  }
}

