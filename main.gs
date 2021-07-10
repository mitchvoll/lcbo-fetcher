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
      [COLUMNS.AVAILABLE_FOR_DELIVERY]: cheerio.productAvailabilityForDelivery,
      [COLUMNS.VALID_URL]: true,
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
