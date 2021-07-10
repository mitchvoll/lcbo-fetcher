# lcbo-fetcher
Hacky google sheet script for fetching some bourbon

### Trigger
Script is attached to a google sheet with a time-based trigger of 30m

### Cookies
Script needs to be loaded with the following cookies. This can be found by navigating to an lcbo page and setting your store location:

```
const COOKIES = {
  "WC_physicalCity": "TORONTO-CENTRAL",
  "WC_physicalStores": "715841646",
  "WC_stCity": "m4t2y4",
  "lang": "en",
  "languagepopupshown": "true",
  "storetype": "clickcollect",
};
```

### Google sheet format
Script pulls `Proudct Url` column and will populate the rest

|Product Url                                                                                                                       |Name                                                                                |Available for Delivery?|Available in Store?|Link Valid?|
|----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-----------------------|-------------------|-----------|
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/blantons-single-barrel-special-reserve-kentucky-straight-bourbon-558320    |Blanton's Single Barrel Special Reserve Kentucky Straight Bourbon (Limit 2 Bottles) |unavailable            |unavailable        |FALSE      |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/w-l-weller-12-year-old-kentucky-straight-bourbon-288886                    |W. L. Weller 12-Year-Old Kentucky Straight Bourbon                                  |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/wl-weller-special-reserve-bourbon-405316#.X58N_S_b3Vo                      |W.L. Weller Special Reserve Bourbon (Limit 2 Bottles)                               |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/weller-antique-107-original-wheated-straight-bourbon-467969#.X58OFC_b3Vo   |Weller Antique 107 Original Wheated Straight Bourbon (Limit 2 Bottles)              |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/blantons-original-bourbon-255349#.X58OUi_b3Vo                              |Blanton's Original Bourbon (Bottle Limit 2)                                         |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/colonel-eh-taylor-small-batch-kentucky-straight-bourbon-326942#.X58OYy_b3Vo|Colonel E.H. Taylor Small Batch Kentucky Straight Bourbon (Limit 2 Bottles)         |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/eagle-rare-10-year-old-kentucky-straight-bourbon-604785#.X58Oei_b3Vo       |Eagle Rare 10 Year Old Kentucky Straight Bourbon (Limit 2 Bottles)                  |unavailable            |unavailable        |TRUE       |
|https://www.lcbo.com/webapp/wcs/stores/servlet/en/lcbo/bookers-kentucky-straight-bourbon-325993#.X58Oli_b3Vo                      |Booker's Kentucky Straight Bourbon                                                  |unavailable            |unavailable        |TRUE       |
