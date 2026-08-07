/**
 * The numbers, pulled out of the Experience bullets where a skimming reader
 * never reaches them.
 *
 * Every figure here already appears verbatim in `DATA.work[0].description` —
 * this is a second surface for the same claims, not a new set of them. If a
 * number changes there it has to change here, and nowhere else.
 *
 * `value` is deliberately short enough to hold its line at ~200px, since these
 * sit four across on desktop.
 */
export const IMPACT = [
  {
    value: "1,539",
    label: "Applications processed",
    note: "Across 3 academic years on the admissions portal",
  },
  {
    value: "11,368",
    label: "Documents digitised",
    note: "Uploaded, validated and merged server-side",
  },
  {
    value: "3 days → same-day",
    label: "Candidate screening",
    note: "For 200+ monthly applicants, after the ATS rebuild",
  },
  {
    value: "80%",
    label: "Less manual data entry",
    note: "Careers portal posts straight into Manatal over its REST API",
  },
] as const;
