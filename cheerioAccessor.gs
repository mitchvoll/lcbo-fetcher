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
      if(this.productName && this.productAvailabilityForDelivery && this.productAvailabilityToStore) {
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

  get productAvailabilityForDelivery() {
    if (this._productAvailabilityForDelivery_) return this._productAvailabilityForDelivery_;

    const raw = this.cheerio('.inventoryOption').first().text().split('\n')[2].trim();
    return this._productAvailabilityForDelivery_ = AVAILABILITY_MAP[raw] || raw;
  }

  get productAvailabilityToStore() {
    if (this._productAvailabilityToStore_) return this._productAvailabilityToStore_;

    const raw = this.cheerio('.inventoryOption').last().text().split('\n')[2].trim();
    return this._productAvailabilityToStore_ = AVAILABILITY_MAP[raw] || raw;
  }
}
