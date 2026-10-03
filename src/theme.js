/**
 * Single visual template ("plantilla única") for every generated report (RF-03).
 *
 * All colors are hex strings without a leading `#`, fonts are family names,
 * and sizes are in points (fontSize) or inches (layout).
 * Keeping every visual constant here guarantees one consistent deck style.
 */
export const theme = {
  colors: {
    /** Corporate dark-blue header bar (spec-mandated). */
    header: '1F3864',
    /** Text drawn on top of the header bar. */
    onHeader: 'FFFFFF',
    /** Secondary corporate blue used for accents and rules. */
    accent: '2E75B6',
    /** Default body text. */
    body: '333333',
    /** De-emphasized text (footers, empty states). */
    muted: '7F7F7F',
    /** Table cell borders. */
    border: 'D9D9D9',
    /** Table header fill. */
    tableHeader: '1F3864',
    /** Zebra striping for alternate table rows. */
    tableAlt: 'EDF2FA',
    /** Slide background. */
    background: 'FFFFFF',
    /** Chart palette (summary graphic, RF-13). */
    chart: ['1F3864', '2E75B6', '5B9BD5', '9DC3E6', 'C9DAF0', '2F5597'],
  },
  fonts: {
    heading: 'Calibri',
    body: 'Calibri',
  },
  sizes: {
    coverTitle: 34,
    coverSubtitle: 16,
    slideTitle: 22,
    body: 12,
    table: 10,
    footer: 9,
  },
  layout: {
    /** pptxgenjs LAYOUT_WIDE is 13.333 x 7.5 inches. */
    width: 13.333,
    height: 7.5,
    margin: 0.5,
    headerHeight: 0.9,
    footerHeight: 0.35,
  },
};
