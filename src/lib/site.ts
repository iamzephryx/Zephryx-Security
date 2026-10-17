/**
 * Single source of truth for identity, links, services, prices and metadata.
 * Nothing else in the app should hardcode a link, an email address, a
 * service name or a price.
 */

export const SITE = {
  name: 'Zephryx Security',
  short: 'Security',
  parentName: 'Zephryx',
  parentUrl: 'https://zephryx.in',
  domain: 'security.zephryx.in',
  url: 'https://security.zephryx.in',
  tagline: 'Penetration testing for startups and growing businesses, run by the person who does the work.',
  description:
    'Zephryx Security is boutique offensive security — web and API, external network, Active Directory and detection-review testing for startups and growing businesses in India, with the scope and price agreed before work starts. No bench of juniors, no scanner-and-forward: every engagement is tested, reported and retested by the same person you scoped it with.',
  locale: 'en_IN',
} as const;

export const MAILBOX = {
  address: 'hello@security.zephryx.in',
} as const;

export const GITHUB_URL = 'https://github.com/iamzephryx';

/** Policy page shared with `.well-known/security.txt` (`Policy:` line). */
export const DISCLOSURE = {
  href: 'https://zephryx.in/security/',
  label: 'Disclosure policy',
} as const;

/**
 * Registered-business details for the footer. Left undefined until they
 * exist: the footer renders a legal line only when this is set, and must
 * never show placeholder text on the live site.
 */
export type SiteLegal = { line: string };
export const LEGAL = undefined as SiteLegal | undefined;

/**
 * Open / paused switch. Read at build time by pages and by the Worker, so
 * flipping `accepting` needs a rebuild and a deploy.
 */
export const ENGAGEMENT = {
  /** false: every CTA says "Join the waitlist", /contact/ shows the waitlist form,
   *  /api/quote refuses, /api/waitlist accepts. true: the reverse. */
  accepting: false as boolean,
  /** Must match what the owner can actually honour. Shown in several places. */
  replyWithin: '2 business days',
  retestWindowDays: 30,
};

/** Bump whenever /privacy/ changes; stored with each lead's consent record. */
export const PRIVACY_NOTICE_VERSION = '2026-10-17';

/** Caps shared by the form and the Worker so the two cannot drift apart. */
export const FORM_LIMITS = {
  name: 80,
  email: 120,
  company: 200,
  notes: 4000,
} as const;

/** Everything that changes with `ENGAGEMENT.accepting`, in one place. */
export const MODE = ENGAGEMENT.accepting
  ? {
      cta: 'Request a scoping call',
      eyebrow: 'OFFENSIVE SECURITY · AVAILABLE FOR NEW ENGAGEMENTS',
      status: 'available for new engagements',
      heroNote: 'The scoping call is free. You receive a written proposal before any work begins.',
      contactTitle: 'Request a scoping call',
      contactDescription: `Tell me what you want tested. I reply within ${ENGAGEMENT.replyWithin} to arrange a free call, then send a written proposal with a fixed scope and price.`,
      closingText: 'You will get a straight answer on scope, price, and whether I am the right person for the job.',
    }
  : {
      cta: 'Join the waitlist',
      eyebrow: 'OFFENSIVE SECURITY · NEW ENGAGEMENTS PAUSED · WAITLIST OPEN',
      status: 'new engagements paused · waitlist open',
      heroNote: 'New engagements are paused for now. Join the waitlist and I will email you when scheduling opens.',
      contactTitle: 'Join the waitlist',
      contactDescription:
        'New engagements are paused for now. Leave your email and I will tell you when scheduling opens. Joining commits you to nothing.',
      closingText: 'Join the waitlist and you hear first, with the prices and slots available at that time.',
    };

/**
 * The rest of the network.
 *
 * Hostnames belong here rather than inline in a page, same rule as everything
 * else in this file — the research corpus moving to its own domain broke two
 * links on /about/ and a label in the footer precisely because those were
 * written out by hand where nobody would think to look for them.
 *
 * `blurb` is what each site is for. Three hostnames off one domain is exactly
 * the case where a bare hostname makes a reader guess.
 */
export const NETWORK = [
  {
    href: 'https://zephryx.in/',
    host: 'zephryx.in',
    blurb: 'portfolio & tooling',
  },
  {
    href: 'https://writeups.zephryx.in/',
    host: 'writeups.zephryx.in',
    blurb: 'research & writeups',
  },
  {
    href: 'https://academy.zephryx.in/',
    host: 'academy.zephryx.in',
    blurb: 'training',
  },
] as const;

/**
 * The public work this site points at as evidence.
 *
 * This is the credibility story: verifiable rather than asserted. Each entry
 * has to resolve directly — a link that only works via a redirect is a link
 * that will eventually stop working, and these exist to be checked.
 */
export const PUBLIC_WORK = [
  {
    href: 'https://writeups.zephryx.in/writeups/',
    label: 'writeups.zephryx.in/writeups',
    title: 'Writeups',
    blurb:
      'Attack-path research, dead ends included — the same reasoning that goes into a client engagement.',
  },
  {
    href: 'https://zephryx.in/arsenal/',
    label: 'zephryx.in/arsenal',
    title: 'Tooling',
    blurb:
      'Open-source recon and detection-engineering tools, including SigmaWarden, the Sigma-rule linter used to validate the rules delivered on Detection review engagements.',
  },
  {
    href: 'https://writeups.zephryx.in/detections/',
    label: 'writeups.zephryx.in/detections',
    title: 'Detections',
    blurb:
      'Published Sigma rules mapped to MITRE ATT&CK — the format every Detection review deliverable follows.',
  },
] as const;

/**
 * `external` marks a link to a different origin (the parent research site,
 * not a page on this one) — rendered as a plain anchor opened in a new tab
 * so it never enters client-side routing. The footer already carries a
 * dedicated zephryx.in link in its CONTACT column, so Footer filters this
 * entry out of the ROUTES list rather than showing it twice.
 *
 * `header: false` keeps an entry out of the header only. Contact is covered
 * there by the CTA button; it stays in the footer routes and the sitemap.
 */
export const NAV = [
  { href: '/', label: 'Home', cmd: '~', external: false, header: true },
  { href: '/services/', label: 'Services', cmd: 'ls', external: false, header: true },
  { href: '/pricing/', label: 'Pricing', cmd: 'quote', external: false, header: true },
  { href: '/process/', label: 'Process', cmd: 'run', external: false, header: true },
  { href: '/about/', label: 'About', cmd: 'whoami', external: false, header: true },
  { href: SITE.parentUrl, label: 'zephryx.in', cmd: 'parent', external: true, header: true },
  { href: '/contact/', label: 'Contact', cmd: 'handshake', external: false, header: false },
] as const;

/* ------------------------------------------------------------------ pricing */

export type Price =
  | { kind: 'from'; inr: number }
  | { kind: 'quoted' }
  | { kind: 'on-request' };

export type Plan = {
  id: string;
  serviceId: string;
  name: string;
  blurb: string;
  covers: string;
  /** Only the web plans are sized by roles and environments. */
  roles?: string;
  environments?: string;
  delivery: string;
  includes: string;
  price: Price;
  /** Small line under the price. */
  note: string;
};

const GST_NOTE = 'GST added where it applies';
const INCLUDES = 'Report, leadership summary, debrief call, one retest';

/**
 * UNVALIDATED placeholder prices, owner decision pending.
 *
 * Every figure, delivery time and scope limit below is a draft from the
 * redesign spec, not a validated rate card. Do not flip ENGAGEMENT.accepting
 * to true until each one is confirmed. These rows are the only place a price
 * is written; every page renders from here.
 */
export const PRICING: Plan[] = [
  {
    id: 'web-focused',
    serviceId: 'web-application-penetration-testing',
    name: 'Focused',
    blurb: 'For one product with a modest surface.',
    covers: 'Up to 25 screens or API endpoints',
    roles: '2, with test accounts from you',
    environments: '1, staging preferred',
    delivery: '2 to 3 weeks from kickoff',
    includes: INCLUDES,
    price: { kind: 'from', inr: 45000 },
    note: GST_NOTE,
  },
  {
    id: 'web-standard',
    serviceId: 'web-application-penetration-testing',
    name: 'Standard',
    blurb: 'For a product with several user types and a full API.',
    covers: 'Up to 60 screens or API endpoints',
    roles: 'Up to 4, with test accounts from you',
    environments: '1, staging preferred',
    delivery: '3 to 5 weeks from kickoff',
    includes: INCLUDES,
    price: { kind: 'from', inr: 95000 },
    note: GST_NOTE,
  },
  {
    id: 'web-larger',
    serviceId: 'web-application-penetration-testing',
    name: 'Larger',
    blurb: 'For several applications or complex flows.',
    covers:
      'More than 60 screens or endpoints, several applications, or complex payment and single sign-on flows',
    roles: 'As needed',
    environments: 'Agreed in the proposal',
    delivery: 'Agreed in the proposal',
    includes: INCLUDES,
    price: { kind: 'quoted' },
    note: 'After the scoping call',
  },
  {
    id: 'network',
    serviceId: 'network-infrastructure-penetration-testing',
    name: 'External network and attack surface',
    blurb:
      'Up to 25 public hosts. Exposed services are found and validated, and exploited only if you allow it.',
    covers: 'Up to 25 public hosts',
    delivery: '1 to 2 weeks from kickoff',
    includes: INCLUDES,
    price: { kind: 'from', inr: 40000 },
    note: GST_NOTE,
  },
  {
    id: 'ad',
    serviceId: 'active-directory-security-assessment',
    name: 'Active Directory assessment',
    blurb:
      'One domain, up to 50 hosts. Testing starts from an ordinary domain user account. Access runs through a VPN or a jump host that you provide.',
    covers: 'One domain, up to 50 hosts',
    delivery: '2 to 3 weeks from kickoff',
    includes: INCLUDES,
    price: { kind: 'from', inr: 80000 },
    note: GST_NOTE,
  },
  {
    id: 'detection',
    serviceId: 'purple-team-detection-engineering',
    name: 'Detection review',
    blurb:
      'Scope depends on your logging setup and how many techniques we test. You receive a coverage map against MITRE ATT&CK and Sigma rules for the gaps.',
    covers: 'Scoped to your logging setup',
    delivery: 'Agreed in the proposal',
    includes: INCLUDES,
    price: { kind: 'on-request' },
    note: 'After the scoping call',
  },
];

/** Indian digit grouping (45,000 / 1,25,000), independent of the build's ICU data. */
function inr(n: number): string {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  return `${s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${s.slice(-3)}`;
}

/** The figure itself, e.g. `₹45,000`, or the word used when there is none. */
export function priceFigure(p: Price): string {
  if (p.kind === 'from') return `₹${inr(p.inr)}`;
  return p.kind === 'quoted' ? 'Quoted' : 'On request';
}

/** Full label, e.g. `From ₹45,000`. */
export function priceLabel(p: Price): string {
  return p.kind === 'from' ? `From ${priceFigure(p)}` : priceFigure(p);
}

export function getPlan(id: string): Plan {
  const plan = PRICING.find((p) => p.id === id);
  if (!plan) throw new Error(`unknown plan: ${id}`);
  return plan;
}

export function plansFor(serviceId: string): Plan[] {
  return PRICING.filter((p) => p.serviceId === serviceId);
}

/** Lowest "from" price for a service, or its non-numeric label. */
export function startingPrice(serviceId: string): Price {
  const plans = plansFor(serviceId);
  const fromPlans = plans.filter((p): p is Plan & { price: { kind: 'from'; inr: number } } => p.price.kind === 'from');
  if (fromPlans.length === 0) return plans[0]?.price ?? { kind: 'on-request' };
  return fromPlans.reduce((a, b) => (b.price.inr < a.price.inr ? b : a)).price;
}

/* ----------------------------------------------------------------- services */

/** Deliverables common to every engagement, shown on /pricing/ and each service page. */
const REPORT_ITEMS = [
  'A written report with a one-page leadership summary.',
  'A live debrief call with your team.',
  `One retest of critical and high findings, within ${ENGAGEMENT.retestWindowDays} days of the report.`,
];

export const INCLUDED_IN_EVERY_ENGAGEMENT = [
  'A written proposal with fixed scope and price.',
  'A rules-of-engagement document and an NDA, signed before testing.',
  'Immediate notice of any critical finding.',
  ...REPORT_ITEMS,
];

export const NOT_INCLUDED = [
  'Further retests after the first, which are quoted separately.',
  'Reports formatted for regulators or certification bodies.',
  'On-site work, which is quoted separately.',
  'Monitoring or support after the engagement ends.',
];

export type Service = {
  id: string;
  title: string;
  /** Short name for compact UI. */
  short: string;
  /** Option label in the request and waitlist forms. */
  formLabel: string;
  tagline: string;
  /** One line under the title in lists. */
  scopeLine: string;
  summary: string;
  description: string;
  idealFor: string[];
  inScope: string[];
  deliverables: string[];
};

export const SERVICES: Service[] = [
  {
    id: 'web-application-penetration-testing',
    title: 'Web and API assessment',
    short: 'Web & API',
    formLabel: 'Web application or API',
    tagline: 'Manual testing of the application, and the APIs behind it, that your customers actually use.',
    scopeLine: 'Scopes sized by screens, endpoints, and user roles',
    summary:
      'Manual testing of login, access control, business logic, and input handling in your web application and its APIs.',
    description:
      'Manual testing of login, access control, business logic, and input handling in your web application and its APIs. Automated scanners often miss flaws in business logic, so this part is done by hand. Broken object-level authorization — one user’s ID swapped for another’s in a request that still returns 200 — is a common API finding, and it is invisible if you only click through the UI, so the API is tested directly: every endpoint, every role, every object reference.',
    idealFor: [
      'SaaS products ahead of a launch, funding round, or enterprise deal',
      'Apps and APIs handling auth, payments, or customer data',
      'Multi-tenant SaaS where tenant isolation is the whole security model',
      'Teams that have only ever run an automated scan',
    ],
    inScope: [
      'Authentication, session management & authorization (including role/tenant isolation)',
      'Business logic abuse (pricing, checkout, invite/referral flows, rate limits)',
      'Injection classes: SQLi, SSTI, command injection, XXE',
      'XSS, CSRF, SSRF, and insecure deserialization',
      'File upload, IDOR, and mass-assignment issues',
      'Broken object & function-level authorization (BOLA/BFLA) in REST and GraphQL APIs',
      'Token handling (JWT misconfiguration, key confusion, replay)',
    ],
    deliverables: [
      'Every finding with its severity, the evidence, the steps to reproduce it, and a specific fix',
      'A detection note per finding: what your logs would show, and what alert would catch it',
      ...REPORT_ITEMS,
    ],
  },
  {
    id: 'network-infrastructure-penetration-testing',
    title: 'External network and attack surface',
    short: 'Network',
    formLabel: 'External network',
    tagline: 'What an outsider can find and use, tested the way an intruder would.',
    scopeLine: 'Up to 25 public hosts',
    summary:
      'What an outsider can find and use: exposed services, forgotten hosts, weak configurations, and known vulnerabilities that are actually reachable.',
    description:
      'What an outsider can find and use: exposed services, forgotten hosts, weak configurations, and known vulnerabilities that are actually reachable. Exploitation happens only if you allow it. A scanner reports what is listening; this engagement works out which of it matters.',
    idealFor: [
      'Companies with their own internet-facing servers, VPN endpoints, or on-prem infrastructure',
      'Anyone who has never had their public attack surface checked from the outside',
      'Businesses about to take over another company’s infrastructure',
    ],
    inScope: [
      'External attack surface enumeration, including forgotten hosts',
      'Exposed services found and validated',
      'Credential exposure, weak services, and default configurations',
      'Known vulnerabilities that are actually reachable',
      'Exploitation, only if you allow it',
    ],
    deliverables: [
      'Every finding with its severity, the evidence, the steps to reproduce it, and a specific fix',
      'A detection note per finding: what your logs would show, and what alert would catch it',
      ...REPORT_ITEMS,
    ],
  },
  {
    id: 'active-directory-security-assessment',
    title: 'Active Directory assessment',
    short: 'Active Directory',
    formLabel: 'Active Directory',
    tagline: 'The attack paths that turn one stolen account into domain admin.',
    scopeLine: 'One domain, up to 50 hosts',
    summary:
      'An assumed-breach test of your Windows domain, starting from an ordinary user account, showing how far a single stolen account could go.',
    description:
      'An assumed-breach test of your Windows domain, starting from an ordinary user account. I check Kerberos abuse, risky permissions, delegation, and certificate services, and show how far a single stolen account could go. A misconfigured ACL three hops from a help-desk account or unconstrained delegation left on from a migration years ago will not show up in a vulnerability scan, and it is how domains actually fall. Access runs through a VPN or a jump host that you provide.',
    idealFor: [
      'Any business running Windows AD for identity — most mid-size companies do',
      'Post-acquisition environments where two domains were merged in a hurry',
      'Teams who’ve had a pentest before but it never actually touched AD',
    ],
    inScope: [
      'Kerberoasting & AS-REP roasting',
      'ACL and delegation abuse (constrained, unconstrained, RBCD)',
      'Certificate services misconfiguration',
      'Credential relay and pass-the-hash paths',
      'GPO misconfiguration',
      'Domain admin path mapping from a standard user foothold',
    ],
    deliverables: [
      'An attack-path map, not just a findings list — see which fix collapses which path',
      'Every finding with its severity, the evidence, the steps to reproduce it, and a specific fix',
      'A detection note per finding: what your logs would show, and what alert would catch it',
      ...REPORT_ITEMS,
    ],
  },
  {
    id: 'purple-team-detection-engineering',
    title: 'Detection review',
    short: 'Detection review',
    formLabel: 'Detection review',
    tagline: 'Which attacker techniques your logs and alerts catch, and Sigma rules for the ones they miss.',
    scopeLine: 'Scoped to your logging setup',
    summary:
      'Attacker techniques run in your environment, checked against what your logs and alerts catch, with a coverage map against MITRE ATT&CK and Sigma rules for the gaps.',
    description:
      'I run attacker techniques in your environment and check which ones your logs and alerts catch. You receive a coverage map against MITRE ATT&CK and Sigma rules for the gaps. This is the same detection-engineering work published openly on zephryx.in, applied to your environment instead of a lab.',
    idealFor: [
      'Teams with a SOC or SIEM who want detections, not just findings',
      'Companies that have already run a standard pentest and want the other half',
      'Anyone who wants to know what their logging would have actually caught',
    ],
    inScope: [
      'Attacker techniques run in your environment, agreed in advance',
      'MITRE ATT&CK mapping for every technique executed',
      'A coverage map of what your logs and alerts caught',
      'Sigma rules for the gaps',
      'Log-source coverage gap analysis',
    ],
    deliverables: [
      'Attack narrative mapped to ATT&CK, technique by technique',
      'A coverage map against MITRE ATT&CK, and Sigma rules for the gaps',
      ...REPORT_ITEMS,
    ],
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/**
 * Old service slugs that no longer exist, mapped to where they now live.
 * The Worker answers these with a 301 before falling through to the assets.
 */
export const REMOVED_SERVICE_REDIRECTS: Record<string, string> = {
  'api-security-testing': '/services/web-application-penetration-testing/',
  'cloud-security-assessment': '/services/',
  'social-engineering-phishing-simulation': '/services/',
  'compliance-ready-penetration-testing': '/services/',
};

/* ------------------------------------------------------------ request forms */

export type Option = { id: string; label: string };

export const NOT_SURE_SERVICE: Option = { id: 'not-sure', label: 'Not sure yet' };

/** Option lists for the request and waitlist forms; the Worker validates against the same ids. */
export const REQUEST_OPTIONS = {
  size: [
    { id: 'up-to-25', label: 'Up to 25 screens or endpoints' },
    { id: 'up-to-60', label: 'Up to 60 screens or endpoints' },
    { id: 'over-60', label: 'More than 60' },
    { id: 'unknown', label: 'I do not know' },
  ],
  environment: [
    { id: 'staging', label: 'A staging copy' },
    { id: 'production', label: 'Production' },
    { id: 'unsure', label: 'Not sure' },
  ],
  timeline: [
    { id: 'month', label: 'Within a month' },
    { id: 'quarter', label: 'Within a quarter' },
    { id: 'none', label: 'No fixed date' },
  ],
} as const satisfies Record<string, readonly Option[]>;

export const SERVICE_CHOICES: Option[] = [
  ...SERVICES.map((s) => ({ id: s.id, label: s.formLabel })),
  NOT_SURE_SERVICE,
];

/* ------------------------------------------------------------------ process */

export type ProcessStep = {
  n: string;
  title: string;
  body: string;
};

export const PROCESS: ProcessStep[] = [
  {
    n: '01',
    title: 'Scoping call',
    body: 'We agree what is in scope, what is out, and what worries you most. You hear what I would test and what I would not.',
  },
  {
    n: '02',
    title: 'Proposal and paperwork',
    body: 'You receive a fixed-scope proposal. A rules-of-engagement document and an NDA are signed before any testing starts.',
  },
  {
    n: '03',
    title: 'Testing',
    body: 'Testing runs inside the windows we agreed. Longer engagements get a midpoint check-in. Critical findings reach you immediately.',
  },
  {
    n: '04',
    title: 'Report and debrief',
    body: 'A written report, then a live call where I walk your team through each finding and answer questions.',
  },
  {
    n: '05',
    title: 'Retest',
    body: `After you ship fixes, I retest the critical and high findings once, within ${ENGAGEMENT.retestWindowDays} days of the report.`,
  },
];

export const RULES = [
  {
    title: 'Written authorisation first',
    body: 'I do not start until the person who owns the system has approved the test in writing.',
  },
  {
    title: 'Destructive tests are opt-in',
    body: 'Denial-of-service style testing happens only if you ask for it.',
  },
  {
    title: 'Staging before production',
    body: 'I prefer a staging copy. Testing production needs your written agreement on the approach and the time windows.',
  },
  {
    title: 'Your data stays minimal',
    body: 'Anything I access is reported, kept to what is needed to prove the finding, and deleted when the engagement ends.',
  },
] as const;

/** Further rules shown on /process/ only. */
export const EXTRA_RULES = [
  'Nothing is tested outside the written scope — no exceptions, no "while I was in there".',
  'A critical, exploitable-right-now finding gets reported immediately, not held for the final report.',
] as const;

export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: 'How long does an engagement take?',
    a: 'Most take two to five weeks from kickoff to report, depending on scope. The proposal states the dates. Testing happens in agreed windows, so you always know when traffic from me will reach your systems.',
  },
  {
    q: 'Will testing take my application down?',
    a: 'It should not. Denial-of-service style testing is opt-in only. I prefer to test a staging copy. If you want production tested, we agree the approach and the time windows in writing first, and I use gentler techniques.',
  },
  {
    q: 'What do I receive at the end?',
    a: 'A written report with a leadership summary, every finding with severity, evidence, and steps to reproduce, a specific fix for each one, and a detection note. Then a live debrief call with your team.',
  },
  {
    q: 'Is a retest included?',
    a: `Yes. After you ship fixes, I retest the critical and high findings once, within ${ENGAGEMENT.retestWindowDays} days of the report. Further retests are quoted separately.`,
  },
  {
    q: 'Can I use the report for SOC 2, ISO 27001, or a customer questionnaire?',
    a: 'You can share the report with auditors and customers as evidence that testing took place. Whether it meets a specific requirement is their decision, so ask them what they need before we scope.',
  },
  {
    q: 'How do you handle our data and credentials?',
    a: 'Test accounts and access details travel over the channel we agree in the proposal. Anything I access during testing is reported, kept to the minimum needed to prove the finding, and deleted when the engagement ends.',
  },
  {
    q: 'What do you need from us before starting?',
    a: 'Written authorisation from the system owner, a signed rules-of-engagement document and NDA, test accounts for each user role in scope, and a technical contact who can reach your team during testing.',
  },
];
