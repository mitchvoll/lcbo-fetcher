const COLUMNS = { URL: 1, PRODUCT_NAME: 2, AVAILABLE_FOR_DELIVERY: 3, AVAILABLE_IN_STORE: 4, VALID_URL: 5 };
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

function main() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const newlyAvailableProducts = [];
  
  for (let i = 2; i < range.getNumRows() + 1; i++) {
    const product = new ProductAccessor(range, i);
    const cheerio = new CheerioAccessor(product.url);

    if (!cheerio.isValid()) {
      if (product.isLinkValid()) {
        product.markLinkInvalid();
        sendBrokenLinkDetected(product.name);
      }
    
      continue
    }
    
    if (!product.isAvailableInStore() && cheerio.isAvailableInStore()) {
      newlyAvailableProducts.push(product);
    }
    else if (!product.isAvailableForDelivery() && cheerio.isAvailableForDelivery()) {
      newlyAvailableProducts.push(product);
    }

    product.setAttributes({
      [COLUMNS.PRODUCT_NAME]: cheerio.productName,
      [COLUMNS.AVAILABLE_IN_STORE]: cheerio.productAvailabilityToStore,
      [COLUMNS.AVAILABLE_FOR_DELIVERY]: cheerio.productAvailabilityDelivery,
      [COLUMNS.VALID_URL]: 'true',
    });
  };

  sendNowAvailableForProducts(newlyAvailableProducts);
}

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
    this.attribute(COLUMNS.VALID_URL).setValue('false');
  }

  isAvailableInStore() {
    return this.attribute(COLUMNS.AVAILABLE_IN_STORE).getValue() === 'available';
  }
  isAvailableForDelivery() {
    return this.attribute(COLUMNS.AVAILABLE_FOR_DELIVERY).getValue() === 'available';
  }
  isLinkValid() {
    return this.attribute(COLUMNS.VALID_URL).getValue() !== 'false';
  }

  
}

