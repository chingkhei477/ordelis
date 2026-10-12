/*
  Ordelis — live offers list
  ------------------------------------------------------------
  Add an offer ONLY after the partnership/affiliate programme is approved
  and you have tested that tracking works. Leave the list empty until then —
  the Offers page shows an honest "no live offers yet" message automatically.

  Each offer:
  {
    store:    "Store name",                       // required
    category: "Fashion",                          // optional, used for filters
    cashback: "Up to 5% cashback",                // required — the rate the network actually pays you to share
    terms:    "Not valid on gift cards. Confirmed after the 30-day return window.", // optional
    link:     "https://your-tracking-link",       // required, must start with https://
    verified: "11 Oct 2026"                       // optional — date you last checked the rate
  }
*/
window.ORDELIS_OFFERS = [
];
