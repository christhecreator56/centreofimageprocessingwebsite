/**
 * Bundled fallback content.
 *
 * This is what the site renders when no Supabase project is configured, and
 * what it falls back to if a query fails. Keeping it here (rather than inline
 * in the components) means the public sections have exactly one shape to
 * render, whether the rows came from the database or from this file — the
 * field names match the table columns.
 */

export const FALLBACK_PROJECTS = [
  {
    id: 'genesis',
    year: '2026',
    category: 'Architecture',
    title: 'Project Genesis',
    description:
      'Real-time multispectral satellite imaging analysis utilizing quantum-inspired neural networks to map topographical anomalies.',
    image_url:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    link_url: '#',
    sort_order: 1,
  },
  {
    id: 'ocular',
    year: '2025',
    category: 'Automation',
    title: 'Ocular V2',
    description:
      'Automated defect detection in micro-manufacturing pipelines. Capable of analyzing 10,000 components per minute with zero false positives.',
    image_url:
      'https://images.unsplash.com/photo-1616161560417-66d4db528429?auto=format&fit=crop&w=1200&q=80',
    link_url: '#',
    sort_order: 2,
  },
  {
    id: 'mesh',
    year: '2024',
    category: 'Medical',
    title: 'Neural Mesh',
    description:
      'High-fidelity 3D reconstruction of cellular structures from 2D electron microscopy scans, revolutionizing non-invasive diagnostics.',
    image_url:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    link_url: '#',
    sort_order: 3,
  },
];

export const FALLBACK_EVENTS = [
  {
    id: 'e1',
    title: 'Edge AI Benchmark',
    description: 'Comparative latency and compute testing of real-time vision pipelines.',
    event_date: '2026-07-10',
    kind: 'symposium',
    accent: 'purple',
  },
  {
    id: 'e2',
    title: 'Optical Flow Workshop',
    description: 'Collaborative session designing dense pixel flow motion estimators.',
    event_date: '2026-07-24',
    kind: 'workshop',
    accent: 'amber',
  },
  {
    id: 'e3',
    title: 'Quantum Imaging Symposium',
    description:
      'Annual gathering of lead researchers discussing photon-level image reconstruction.',
    event_date: '2026-08-15',
    kind: 'symposium',
    accent: 'emerald',
  },
  {
    id: 'e4',
    title: 'Project Genesis Review',
    description:
      'Quarterly internal review of the Genesis architecture and performance metrics.',
    event_date: '2026-08-28',
    kind: 'review',
    accent: 'cyan',
  },
  {
    id: 'e5',
    title: 'Neural Fields Masterclass',
    description:
      'Deep dive into coordinate-based neural representations and volumetric rendering.',
    event_date: '2026-09-08',
    kind: 'workshop',
    accent: 'rose',
  },
  {
    id: 'e6',
    title: 'CIP Advisory Meeting',
    description: 'Bi-annual review panel evaluating funding, patents, and paper submissions.',
    event_date: '2026-09-22',
    kind: 'review',
    accent: 'yellow',
  },
];

export const FALLBACK_REPORTS = [
  {
    id: 'ocular-v2',
    slug: 'ocular-v2',
    kicker: 'Report / Q2 2026',
    title: 'Ocular V2 Launch Highlights',
    image_url:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    image_alt: 'Researcher at a workstation reviewing defect-detection output',
    caption:
      'Bench run of the V2 inference head, taken during the final calibration pass before deployment.',
    summary:
      'The second generation of our defect-detection stack moved inference to the edge, cutting round-trip latency to under a millisecond and removing the cloud dependency entirely. This report walks through the calibration methodology, the false-positive audit across 40,000 sample components, and what the line operators told us after four weeks of live use.',
    published_on: 'June 2026',
    read_time: '12 min',
    team: 'Perception Systems',
    tags: ['Edge inference', 'Quality control', 'Benchmarks'],
    sort_order: 1,
  },
  {
    id: 'vision-conference',
    slug: 'vision-conference',
    kicker: 'Retrospective / 2025',
    title: 'Annual Vision Conference Post-Mortem',
    image_url:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80',
    image_alt: 'Auditorium during a conference keynote session',
    caption: 'Closing keynote of the 2025 programme, where the open dataset release was announced.',
    summary:
      'Three days, nineteen talks, and the first public release of our annotated urban-scene dataset. This retrospective covers what landed, what did not, the attendance and submission numbers against the previous two years, and the format changes we are carrying into the next edition.',
    published_on: 'December 2025',
    read_time: '9 min',
    team: 'Programme Committee',
    tags: ['Events', 'Open data', 'Community'],
    sort_order: 2,
  },
];

/* -------------------------------------------------------------------------- *
 * Calendar shaping
 * -------------------------------------------------------------------------- */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Parse `YYYY-MM-DD` as a local date — `new Date(str)` would treat it as UTC
 *  and shift the day backwards for anyone west of Greenwich. */
export function parseDate(value) {
  const [y, m, d] = String(value).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function monthLabel(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Turn a flat list of event rows into the month-keyed structure the calendar
 * renders, deriving the leading blank cells and month length from the dates
 * themselves. Months with no events are still included when they fall between
 * two months that do, so paging through the calendar doesn't skip.
 */
export function groupEventsByMonth(events) {
  const rows = [...events].sort((a, b) => (a.event_date < b.event_date ? -1 : 1));
  if (!rows.length) return { months: [], byMonth: {} };

  const first = parseDate(rows[0].event_date);
  const last = parseDate(rows[rows.length - 1].event_date);

  const months = [];
  const byMonth = {};
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);

  while (cursor <= last) {
    const label = monthLabel(cursor);
    months.push(label);
    byMonth[label] = {
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      emptyDays: new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay(),
      daysInMonth: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate(),
      events: {},
      list: [],
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  rows.forEach((row) => {
    const date = parseDate(row.event_date);
    const label = monthLabel(date);
    if (!byMonth[label]) return;
    const entry = {
      id: row.id,
      title: row.title,
      desc: row.description,
      type: row.kind,
      color: row.accent,
      day: date.getDate(),
      date,
      location: row.location,
    };
    byMonth[label].events[date.getDate()] = entry;
    byMonth[label].list.push(entry);
  });

  return { months, byMonth };
}
