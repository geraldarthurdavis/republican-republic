/**
 * Site-wide settings. Everything marked TODO must be filled in before launch.
 */
export const site = {
  name: "Sea to Shining Sea",              // working title — the site's own brand, never "The White House"
  tagline: "A record of promises made and kept.",
  url: "https://example.com",              // TODO: production domain
  locale: "en-US",

  // Legal / compliance. If a political committee publishes this site, FEC rules
  // require a clear disclaimer box. Have counsel confirm the exact wording.
  disclaimer: {
    paidForBy: "TODO: Committee name",     // e.g. "Paid for by Example PAC"
    authorization: "Not authorized by any candidate or candidate's committee.", // TODO: confirm
    address: "",                          // TODO: if required
  },

  // Attribution — every promise/result on the site is quoted from this release.
  attribution:
    "Promise and result text is quoted from the White House release “President Trump’s Second Term: Promises Made, Promises Kept, Results Delivered.”",

  // Civic call to action. Link out to official, nonpartisan sources —
  // never hard-code registration deadlines or voting rules.
  vote: {
    electionDate: "2026-11-03",            // TODO: confirm before publishing
    primaryHref: "https://vote.gov",
    primaryLabel: "Find your polling place",
  },
} as const;
