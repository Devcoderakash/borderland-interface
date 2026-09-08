export type SuitKey = "spades" | "diamonds" | "clubs" | "hearts";

export const SUITS: Array<{
  key: SuitKey;
  symbol: string;
  name: string;
  role: string;
  focus: string;
  description: string;
  examples: string[];
  colorClass: string;
  borderClass: string;
  bgClass: string;
}> = [
  {
    key: "spades",
    symbol: "♠",
    name: "SPADES",
    role: "THE BUILDER",
    focus: "Execution • Speed • Engineering",
    description:
      "Build under pressure. Turn an idea into a working prototype before the clock runs out.",
    examples: ["Coding", "Product development", "Implementation", "Rapid prototyping"],
    colorClass: "text-spade",
    borderClass: "border-spade/40",
    bgClass: "bg-spade/10",
  },
  {
    key: "diamonds",
    symbol: "♦",
    name: "DIAMONDS",
    role: "THE THINKER",
    focus: "Logic • AI • Intelligence",
    description: "Solve problems where logic matters more than speed.",
    examples: ["AI/ML", "Data analysis", "Algorithms", "Cybersecurity", "Logic puzzles"],
    colorClass: "text-diamond",
    borderClass: "border-diamond/40",
    bgClass: "bg-diamond/10",
  },
  {
    key: "clubs",
    symbol: "♣",
    name: "CLUBS",
    role: "THE TEAM",
    focus: "Collaboration • Strategy • Communication",
    description: "No single player can survive alone.",
    examples: [
      "Team challenges",
      "System design",
      "Product strategy",
      "Collaborative problem solving",
    ],
    colorClass: "text-club",
    borderClass: "border-club/40",
    bgClass: "bg-club/10",
  },
  {
    key: "hearts",
    symbol: "♥",
    name: "HEARTS",
    role: "THE MIND",
    focus: "Psychology • Decisions • Risk",
    description: "The hardest challenges are not technical. Every decision has consequences.",
    examples: [
      "Ethical AI",
      "Product decisions",
      "User psychology",
      "Strategy",
      "Risk management",
    ],
    colorClass: "text-heart",
    borderClass: "border-heart/40",
    bgClass: "bg-heart/10",
  },
];

export const suitBySymbol: Record<SuitKey, string> = {
  spades: "♠",
  diamonds: "♦",
  clubs: "♣",
  hearts: "♥",
};

export const GAMES = [
  {
    id: "GAME 01",
    title: "THE ENTRY",
    difficulty: 2,
    text: "A short qualification challenge. Only teams that clear it move deeper into the Borderland.",
  },
  {
    id: "GAME 02",
    title: "THE BUILD",
    difficulty: 3,
    text: "Build a working prototype. Execution beats intention.",
  },
  {
    id: "GAME 03",
    title: "THE MIND",
    difficulty: 4,
    text: "Solve a complex technical and strategic challenge under observation.",
  },
  {
    id: "GAME 04",
    title: "THE CHAOS",
    difficulty: 5,
    text: "An unexpected problem statement. The rules you learned no longer apply.",
  },
];

export const RULES = [
  { n: "01", title: "TEAM SIZE", text: "2–4 members." },
  { n: "02", title: "ORIGINALITY", text: "Build your own solution." },
  { n: "03", title: "OPEN TECHNOLOGY", text: "Use any permitted technology." },
  { n: "04", title: "TIME", text: "All submissions must respect the challenge deadline." },
  {
    n: "05",
    title: "AI",
    text: "AI tools are allowed where permitted, but teams must understand and explain their implementation.",
  },
  {
    n: "06",
    title: "FAIR PLAY",
    text: "No plagiarism, cheating or exploitation of the event infrastructure.",
  },
  {
    n: "07",
    title: "JUDGING",
    text: "Solutions are evaluated on innovation, technical quality, impact and presentation.",
  },
];

export const TIMELINE = [
  { day: "DAY 01", time: "10:00 AM", label: "REGISTRATION" },
  { day: "DAY 01", time: "11:00 AM", label: "OPENING CEREMONY" },
  { day: "DAY 01", time: "11:30 AM", label: "GAME 01" },
  { day: "DAY 01", time: "01:00 PM", label: "BUILD PHASE" },
  { day: "DAY 01", time: "04:00 PM", label: "MENTOR ROUND" },
  { day: "DAY 01", time: "07:00 PM", label: "GAME 03" },
  { day: "DAY 01", time: "10:00 PM", label: "FINAL SUBMISSION" },
  { day: "DAY 02", time: "10:00 AM", label: "FINAL PRESENTATIONS" },
  { day: "DAY 02", time: "12:00 PM", label: "JUDGING" },
  { day: "DAY 02", time: "02:00 PM", label: "THE JOKER" },
  { day: "DAY 02", time: "04:00 PM", label: "RESULTS" },
];

export const PRIZES = [
  { amount: 50000, title: "THE SURVIVOR", sub: "First place" },
  { amount: 25000, title: "THE STRATEGIST", sub: "Second place" },
  { amount: 15000, title: "THE BUILDER", sub: "Third place" },
];

export const SPECIAL_AWARDS = [
  "BEST AI SOLUTION",
  "BEST UI/UX",
  "BEST SOCIAL IMPACT",
  "BEST BEGINNER TEAM",
  "MOST CREATIVE HACK",
  "JOKER CHAMPION",
];

export const FAQS = [
  {
    q: "What is Border//Land?",
    a: "Border//Land is a high-stakes technology hackathon built as a series of games. Each round tests a different ability — engineering, logic, teamwork and decision-making under pressure.",
  },
  {
    q: "Who can participate?",
    a: "Any student or early-career builder can enter. Bring curiosity; the games do the rest.",
  },
  { q: "What is the team size?", a: "Teams of 2 to 4 players. Solo entries are not permitted." },
  {
    q: "Do I need prior hackathon experience?",
    a: "No. Several games reward adaptability far more than experience.",
  },
  {
    q: "Can beginners participate?",
    a: "Yes. There is a dedicated Best Beginner Team award, and mentors are available during the build phase.",
  },
  {
    q: "Are AI tools allowed?",
    a: "Yes, where permitted — but your team must be able to explain every part of what you shipped.",
  },
  {
    q: "What technologies can we use?",
    a: "Any language, framework or platform, as long as the work is your own and built during the event.",
  },
  {
    q: "What should we build?",
    a: "Each game reveals its own problem statement. Your suit determines the flavour of the challenges you face.",
  },
  {
    q: "How does judging work?",
    a: "Innovation, technical quality, impact and presentation — scored per game and aggregated on the leaderboard.",
  },
  {
    q: "What happens in the Joker round?",
    a: "The final problem statement is revealed only when the round begins. No preparation is possible.",
  },
  { q: "Is there an entry fee?", a: "No. Entry is free for all selected teams." },
  {
    q: "What should I bring?",
    a: "Laptop, chargers, ID card and any hardware your idea depends on. Everything else is provided.",
  },
];

export const SPONSOR_TIERS = [
  { tier: "TITLE PARTNER", slots: 1 },
  { tier: "GOLD PARTNER", slots: 3 },
  { tier: "SILVER PARTNER", slots: 4 },
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
  "Your skills brought you here.",
  "Your decisions keep you here.",
  "Not everyone reaches the final.",
  "Adapt or exit.",
];
