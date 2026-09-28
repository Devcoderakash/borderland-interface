export type EvaluationCriterion = {
  id: string;
  code: string;
  name: string;
  role: string;
  subtitle: string;
  focus: string;
  description: string;
  weightage: string;
  pct: number;
  colorClass: string;
  borderClass: string;
  bgClass: string;
};

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    id: "01",
    code: "CRITERION_01",
    name: "INNOVATION",
    role: "THE IDEA",
    subtitle: "Originality & Problem Solving",
    focus: "Originality • Problem Solving",
    description:
      "Fresh and creative ideas that address meaningful real-world problems with an innovative approach.",
    weightage: "30%",
    pct: 30,
    colorClass: "text-accent-1",
    borderClass: "border-accent-1/40",
    bgClass: "bg-accent-1/10",
  },
  {
    id: "02",
    code: "CRITERION_02",
    name: "EXECUTION",
    role: "THE BUILD",
    subtitle: "Technical Quality & Architecture",
    focus: "Technical Quality • Architecture",
    description:
      "Quality of implementation, technical depth, functionality, architecture, and effective use of technology.",
    weightage: "30%",
    pct: 30,
    colorClass: "text-accent-2",
    borderClass: "border-accent-2/40",
    bgClass: "bg-accent-2/10",
  },
  {
    id: "03",
    code: "CRITERION_03",
    name: "IMPACT",
    role: "THE SCOPE",
    subtitle: "Feasibility & Real-world Usefulness",
    focus: "Feasibility • Usefulness",
    description:
      "Real-world applicability, scalability, feasibility, usefulness, and potential impact of the solution.",
    weightage: "20%",
    pct: 20,
    colorClass: "text-accent-3",
    borderClass: "border-accent-3/40",
    bgClass: "bg-accent-3/10",
  },
  {
    id: "04",
    code: "CRITERION_04",
    name: "PRESENTATION",
    role: "THE PITCH",
    subtitle: "Clarity, Design & Delivery",
    focus: "Clarity • Design • Delivery",
    description:
      "Clear communication, product demonstration, storytelling, UI/UX quality, and overall pitch delivery.",
    weightage: "20%",
    pct: 20,
    colorClass: "text-accent-4",
    borderClass: "border-accent-4/40",
    bgClass: "bg-accent-4/10",
  },
];

export const ROADMAP = [
  {
    id: "PHASE 01",
    n: 1,
    title: "REGISTRATION",
    window: "ROUND 1",
    text: "Teams register for APEX 1.0 and form their 2–4 member teams.",
    active: true,
  },
  {
    id: "PHASE 02",
    n: 2,
    title: "IDEA SUBMISSION",
    window: "ONLINE",
    text: "Teams prepare and submit their solution idea and presentation before the Round 1 deadline.",
    active: false,
  },
  {
    id: "PHASE 03",
    n: 3,
    title: "SHORTLISTING",
    window: "PANEL REVIEW",
    text: "The submitted ideas are reviewed by the judging panel and selected teams are announced for Round 2.",
    active: false,
  },
  {
    id: "PHASE 04",
    n: 4,
    title: "OFFLINE ARRIVAL",
    window: "BHOPAL",
    text: "Shortlisted teams arrive at the Bhopal venue for the offline hackathon.",
    active: false,
  },
  {
    id: "PHASE 05",
    n: 5,
    title: "BUILD",
    window: "24 HOURS",
    text: "Teams get a fixed 24-hour development window to build and refine their solution.",
    active: false,
  },
  {
    id: "PHASE 06",
    n: 6,
    title: "FINAL PITCH",
    window: "LIVE DEMO",
    text: "Teams present their working solution to the judges and demonstrate their prototype.",
    active: false,
  },
  {
    id: "PHASE 07",
    n: 7,
    title: "RESULTS",
    window: "CEREMONY",
    text: "Final evaluation, winner announcement, prize distribution, and closing ceremony.",
    active: false,
  },
];

export const RULES = [
  { n: "01", title: "TEAM SIZE", text: "Teams must consist of 2–4 members." },
  { n: "02", title: "OPEN INNOVATION", text: "Participants may build solutions across any domain or problem statement." },
  { n: "03", title: "ROUND 1 SUBMISSION", text: "Teams submit their idea presentation (PPT) online before the deadline." },
  { n: "04", title: "REGISTRATION FEE", text: "Round 1 registration fee is ₹150 per team." },
  { n: "05", title: "SHORTLISTING", text: "Only shortlisted teams from Round 1 qualify for the offline Round 2." },
  { n: "06", title: "ROUND 2 OFFLINE", text: "Round 2 is conducted offline at Tech Convention Centre in Bhopal." },
  { n: "07", title: "TECHNOLOGY & AI", text: "Teams may use any programming language, framework, or platform. AI tools are allowed provided participants understand and explain their solution." },
  { n: "08", title: "JUDGING CRITERIA", text: "Projects are evaluated on Innovation (30%), Execution (30%), Impact (20%), and Presentation (20%)." },
];

export const PRIZES = [
  { amount: 50000, title: "GRAND CHAMPION", sub: "First place" },
  { amount: 25000, title: "RUNNER UP", sub: "Second place" },
  { amount: 15000, title: "SECOND RUNNER UP", sub: "Third place" },
];

export const SPECIAL_AWARDS = [
  "BEST AI SOLUTION",
  "BEST UI/UX",
  "BEST SOCIAL IMPACT",
  "BEST BEGINNER TEAM",
  "MOST CREATIVE IDEA",
  "PEOPLE'S CHOICE",
];

export const FAQS = [
  {
    q: "What is APEX 1.0?",
    a: "APEX 1.0 is a two-round open-innovation hackathon where students submit their ideas online and shortlisted teams build and pitch their solutions during the offline final round in Bhopal.",
  },
  {
    q: "Who can participate?",
    a: "Students from any college or university can participate. Form a team of 2–4 members and register your solution.",
  },
  {
    q: "What is the team size?",
    a: "Teams must have 2–4 members. Solo entries are not permitted.",
  },
  {
    q: "How does the two-round format work?",
    a: "Round 1 is online (PPT Idea Submission, ₹150 fee). Shortlisted teams proceed to Round 2 (Offline 24-hour Build & Pitch in Bhopal).",
  },
  {
    q: "Can beginners participate?",
    a: "Yes! There is a dedicated Best Beginner Team award among our special award categories.",
  },
  {
    q: "Are AI tools allowed?",
    a: "Yes. AI tools are allowed, provided participants understand and are able to explain every aspect of the submitted solution.",
  },
  {
    q: "What technologies can we use?",
    a: "Any technology stack, programming language, framework, or platform can be used. We embrace open innovation.",
  },
  {
    q: "What is the theme?",
    a: "Open Innovation. You can build solutions in any domain or problem area.",
  },
  {
    q: "How does judging work?",
    a: "Projects are evaluated on Innovation (30%), Execution (30%), Impact (20%), and Presentation (20%).",
  },
  {
    q: "What is the Round 1 fee?",
    a: "Round 1 requires a ₹150 registration fee per team. The fee for Round 2 will be announced to shortlisted teams.",
  },
  {
    q: "Is Round 2 offline?",
    a: "Yes. Shortlisted teams participate in the offline Round 2 hackathon in Bhopal.",
  },
];

export const SPONSOR_TIERS = [
  { tier: "TITLE SPONSOR", slots: 1 },
  { tier: "GOLD PARTNER", slots: 3 },
  { tier: "TECH PARTNER", slots: 4 },
  { tier: "COMMUNITY PARTNER", slots: 5 },
];

export const ORGANIZERS = [
  { name: "A. VERMA", role: "Hackathon Director", initials: "AV" },
  { name: "R. IYER", role: "Technical Lead", initials: "RI" },
  { name: "S. KHAN", role: "Operations Lead", initials: "SK" },
  { name: "M. RAO", role: "Design Lead", initials: "MR" },
  { name: "T. GUPTA", role: "Community Lead", initials: "TG" },
];

export const MICROCOPY = [
  "One Idea. 24 Hours. No Limits.",
  "Build. Innovate. Pitch. Win.",
  "Your best ideas belong here.",
];
