import type { DemoPersona, Opportunity, UserProfile } from "../types";

const averyProfile: UserProfile = {
  name: "Avery Brooks",
  location: "Oakland, CA",
  headline:
    "Reliable organizer who turns real-life help into polished client support.",
  strengths:
    "I calm people down, keep things organized, tutor younger students, help family members with forms, and make messy schedules make sense.",
  helpRequests:
    "People ask me to edit emails, explain school assignments, set up tech, organize events, and keep group projects on track.",
  experienceNotes:
    "I have volunteer club leadership experience, part-time retail experience, babysitting, tutoring, and helping a neighborhood business with social posts and scheduling.",
  desiredRoles:
    "Remote coordinator, customer support, student success, admin assistant, community programs, freelance local help.",
  workModes: ["remote", "hybrid", "local"],
  incomeSpeed: "this-month",
  availability: "20 to 30 hours per week, evenings available, can start this week.",
};

const mayaProfile: UserProfile = {
  name: "Maya Chen",
  location: "San Jose, CA",
  headline:
    "Student organizer who turns tutoring, campus leadership, and side gigs into polished professional support.",
  strengths:
    "I am good at tutoring, planning group projects, making clear notes, and helping people feel less overwhelmed when a lot is happening at once.",
  helpRequests:
    "Friends ask me for study plans, resume edits, internship application help, event coordination, and fixing messy documents.",
  experienceNotes:
    "I have peer tutoring experience, student club leadership, campus event planning, and part-time cafe customer service.",
  desiredRoles:
    "Student success, internship operations, program coordination, remote customer support, tutoring, freelance academic help.",
  workModes: ["remote", "hybrid"],
  incomeSpeed: "this-month",
  availability: "15 to 20 hours per week during school, more during breaks.",
};

const jordanProfile: UserProfile = {
  name: "Jordan Reyes",
  location: "Phoenix, AZ",
  headline:
    "Career switcher translating frontline retail and family logistics into operations, coordination, and support work.",
  strengths:
    "I stay calm with customers, solve practical problems fast, keep teams moving, and can manage shifts, schedules, and a lot of day-to-day details.",
  helpRequests:
    "People ask me to calm upset customers, train new teammates, organize family appointments, and figure out the next practical step.",
  experienceNotes:
    "I have years of retail supervision, inventory support, schedule coordination, vendor follow-up, and household admin experience.",
  desiredRoles:
    "Operations coordinator, customer success, executive assistant, remote support, office admin, field-to-desk transition roles.",
  workModes: ["remote", "hybrid", "local"],
  incomeSpeed: "now",
  availability: "Full-time, can interview immediately, open to contract or permanent roles.",
};

const samiraProfile: UserProfile = {
  name: "Samira Ali",
  location: "Philadelphia, PA",
  headline:
    "Neighborhood problem-solver turning informal caregiving, community support, and service coordination into paid opportunity.",
  strengths:
    "I am good at coordinating people, helping families with paperwork, checking on elders, finding resources, and keeping important details from slipping through.",
  helpRequests:
    "Neighbors ask me for appointment help, flyer updates, school form support, child pickup coordination, and community event organization.",
  experienceNotes:
    "I have mosque and school volunteer coordination, informal caregiving, translation support for families, and community outreach experience.",
  desiredRoles:
    "Community programs, family support, care coordination, local service offers, outreach assistant, nonprofit operations.",
  workModes: ["local", "hybrid", "remote"],
  incomeSpeed: "this-month",
  availability: "Flexible weekdays, some evenings, available for contract or part-time work.",
};

export const demoPersonas: DemoPersona[] = [
  {
    id: "avery-organizer",
    label: "Avery",
    audience: "Informal experience to polished support roles",
    pitch:
      "Great default story for underestimated talent who already do useful work but need a professional frame.",
    heroStat: "Best for the broadest all-purpose demo path.",
    quickWins: [
      "Shows translation from everyday help to job titles",
      "Balances remote jobs with local service offers",
      "Produces strong resume and tracker output fast",
    ],
    profile: averyProfile,
  },
  {
    id: "maya-student",
    label: "Maya",
    audience: "Student seeking remote or hybrid work",
    pitch:
      "Useful for showing how WorthMatch helps students convert campus leadership and tutoring into paid momentum.",
    heroStat: "Fastest path to student success and tutoring matches.",
    quickWins: [
      "Strong tutoring and student-success translation",
      "Makes internship-style roles feel attainable",
      "Demonstrates ATS keyword generation for early career users",
    ],
    profile: mayaProfile,
  },
  {
    id: "jordan-switcher",
    label: "Jordan",
    audience: "Career changer moving from frontline work",
    pitch:
      "Highlights the bridge from retail, logistics, and family admin into operations and customer success.",
    heroStat: "Best for urgency, pay, and career-switch storytelling.",
    quickWins: [
      "Shows transferability from customer-facing roles",
      "Highlights remote and hybrid coordinator matches",
      "Creates strong professional-summary rewrites",
    ],
    profile: jordanProfile,
  },
  {
    id: "samira-community",
    label: "Samira",
    audience: "Community helper seeking paid local opportunity",
    pitch:
      "Ideal for demonstrating care coordination, neighborhood trust, and direct service offers as real economic value.",
    heroStat: "Best for local paid services and community role demos.",
    quickWins: [
      "Emphasizes informal caregiving and coordination",
      "Surfaces local service offers and community-facing roles",
      "Tells a high-empathy, mission-driven demo story",
    ],
    profile: samiraProfile,
  },
];

export const demoProfile = demoPersonas[0].profile;

export function findDemoPersona(personaId: string) {
  return demoPersonas.find((persona) => persona.id === personaId);
}

export const demoOpportunities: Opportunity[] = [
  {
    id: "brightpath-ops",
    title: "Remote Operations Coordinator",
    organization: "BrightPath Health",
    sourceId: "official-feed",
    sourceLabel: "Approved partner feed",
    sourceType: "official",
    location: "Remote (US)",
    remotePolicy: "remote",
    kind: "full-time",
    experienceLevel: "entry",
    compensation: "$24-$30/hr",
    compensationValue: 82,
    urgencyScore: 77,
    category: "Operations & Support",
    summary:
      "Support a distributed care team with scheduling, documentation, inbox triage, and follow-through for members.",
    responsibilities: [
      "Coordinate schedules and keep task queues moving",
      "Document updates clearly inside CRM workflows",
      "Handle member-facing communication with empathy and speed",
    ],
    qualifications: [
      "Strong written communication",
      "Comfort with calendars or project tools",
      "Able to manage repeat processes without dropping details",
    ],
    skills: [
      "communication",
      "scheduling",
      "documentation",
      "customer support",
      "process coordination",
    ],
    tags: ["remote", "entry friendly", "organized", "people-facing"],
  },
  {
    id: "northline-student-success",
    title: "Student Success Associate",
    organization: "Northline Learning",
    sourceId: "official-feed",
    sourceLabel: "Approved partner feed",
    sourceType: "official",
    location: "Remote (Pacific Time)",
    remotePolicy: "remote",
    kind: "full-time",
    experienceLevel: "entry",
    compensation: "$53k-$61k",
    compensationValue: 78,
    urgencyScore: 88,
    category: "Education & Coaching",
    summary:
      "Guide learners through onboarding, support questions, and weekly accountability outreach.",
    responsibilities: [
      "Welcome learners and answer logistics questions",
      "Track participation and flag students who need support",
      "Coordinate with coaches and program managers",
    ],
    qualifications: [
      "Coaching or tutoring instincts",
      "Clear follow-up habits",
      "Confidence handling multiple conversations per day",
    ],
    skills: ["tutoring", "student support", "follow-up", "communication", "crm"],
    tags: ["remote", "education", "mission-driven", "people-first"],
  },
  {
    id: "ladderloop-founder-assistant",
    title: "Founder Assistant",
    organization: "LadderLoop",
    sourceId: "manual-link-import",
    sourceLabel: "Imported link",
    sourceType: "imported",
    location: "Remote / occasional SF meetups",
    remotePolicy: "hybrid",
    kind: "contract",
    experienceLevel: "growing",
    compensation: "$28-$35/hr",
    compensationValue: 84,
    urgencyScore: 82,
    category: "Executive Support",
    summary:
      "Keep a fast-moving founder organized through inbox triage, lightweight research, travel planning, and calendar management.",
    responsibilities: [
      "Prepare briefs before meetings",
      "Manage a shifting weekly calendar",
      "Draft polished follow-up notes and outreach messages",
    ],
    qualifications: [
      "Administrative instinct",
      "Can write professional emails quickly",
      "Enjoys ambiguity and reprioritizing",
    ],
    skills: [
      "calendar management",
      "writing",
      "research",
      "organization",
      "prioritization",
    ],
    tags: ["hybrid", "fast pace", "contract", "high ownership"],
  },
  {
    id: "oakland-small-business",
    title: "Digital Organizer for Local Businesses",
    organization: "Oakland Small Business Alliance",
    sourceId: "community-board",
    sourceLabel: "Community board",
    sourceType: "community",
    location: "Oakland, CA",
    remotePolicy: "local",
    kind: "contract",
    experienceLevel: "entry",
    compensation: "$1,100 project retainer",
    compensationValue: 72,
    urgencyScore: 91,
    category: "Freelance Services",
    summary:
      "Help neighborhood shops clean up social posts, update flyers, and organize customer follow-up for upcoming events.",
    responsibilities: [
      "Draft weekly social captions",
      "Update simple promo materials and event calendars",
      "Track owner requests and post deadlines",
    ],
    qualifications: [
      "Strong follow-through",
      "Comfort with Canva or similar tools",
      "Friendly communication with small business owners",
    ],
    skills: [
      "social media",
      "canva",
      "organization",
      "customer outreach",
      "event support",
    ],
    tags: ["local", "quick income", "small business", "portfolio builder"],
  },
  {
    id: "family-services-tech-coach",
    title: "Senior Tech Coach",
    organization: "East Bay Family Services",
    sourceId: "community-board",
    sourceLabel: "Community board",
    sourceType: "community",
    location: "Berkeley, CA",
    remotePolicy: "local",
    kind: "part-time",
    experienceLevel: "entry",
    compensation: "$22/hr",
    compensationValue: 64,
    urgencyScore: 86,
    category: "Community Support",
    summary:
      "Teach older adults how to use phones, portals, and video calls in a calm and welcoming environment.",
    responsibilities: [
      "Lead one-on-one tech help sessions",
      "Create easy walkthroughs for common tasks",
      "Set up devices and troubleshoot account issues",
    ],
    qualifications: [
      "Patience teaching beginners",
      "Comfort setting up devices",
      "Warm in-person communication",
    ],
    skills: [
      "tech setup",
      "teaching",
      "troubleshooting",
      "patience",
      "communication",
    ],
    tags: ["local", "community", "teaching", "steady schedule"],
  },
  {
    id: "mosswood-learning",
    title: "Tutor + Family Admin Lead",
    organization: "Mosswood Learning Co.",
    sourceId: "classifieds-import",
    sourceLabel: "Imported listing",
    sourceType: "imported",
    location: "Oakland / Hybrid",
    remotePolicy: "hybrid",
    kind: "part-time",
    experienceLevel: "entry",
    compensation: "$26-$32/hr",
    compensationValue: 76,
    urgencyScore: 80,
    category: "Education & Coaching",
    summary:
      "Blend tutoring support with family communication, scheduling, and basic admin for a growing after-school program.",
    responsibilities: [
      "Tutor students in study sessions",
      "Coordinate parent updates and schedule changes",
      "Maintain polished notes on student progress",
    ],
    qualifications: [
      "Tutoring or mentoring ability",
      "Strong note-taking",
      "Comfort communicating with families",
    ],
    skills: [
      "tutoring",
      "scheduling",
      "parent communication",
      "organization",
      "note-taking",
    ],
    tags: ["hybrid", "education", "family-facing", "part-time"],
  },
  {
    id: "threadline-support",
    title: "Customer Support Specialist",
    organization: "Threadline",
    sourceId: "official-feed",
    sourceLabel: "Approved partner feed",
    sourceType: "official",
    location: "Remote",
    remotePolicy: "remote",
    kind: "full-time",
    experienceLevel: "entry",
    compensation: "$49k + bonus",
    compensationValue: 74,
    urgencyScore: 74,
    category: "Customer Experience",
    summary:
      "Deliver clear, human support across email and chat while spotting repeat friction points for the product team.",
    responsibilities: [
      "Answer customer issues across support channels",
      "Write polished macros and help-center notes",
      "Share patterns with the operations team",
    ],
    qualifications: [
      "Customer empathy",
      "Strong writing",
      "Organized case management",
    ],
    skills: [
      "customer support",
      "writing",
      "triage",
      "documentation",
      "problem solving",
    ],
    tags: ["remote", "entry friendly", "writing heavy", "stable"],
  },
  {
    id: "neighbor-concierge",
    title: "Neighborhood Organizer & Errand Concierge",
    organization: "Independent Clients",
    sourceId: "manual-card",
    sourceLabel: "Saved opportunity",
    sourceType: "manual",
    location: "Oakland, CA",
    remotePolicy: "local",
    kind: "gig",
    experienceLevel: "entry",
    compensation: "$35-$45/hr",
    compensationValue: 86,
    urgencyScore: 93,
    category: "Freelance Services",
    summary:
      "Offer organized home help, calendar cleanup, errands, and appointment coordination for busy households.",
    responsibilities: [
      "Coordinate errands and appointments",
      "Set up simple family systems and reminders",
      "Communicate clearly with clients about priorities",
    ],
    qualifications: [
      "Trustworthy follow-through",
      "Comfort working independently",
      "Organizing instinct",
    ],
    skills: [
      "organization",
      "errands",
      "client communication",
      "time management",
      "reliability",
    ],
    tags: ["local", "fast cash", "freelance", "relationship-based"],
  },
  {
    id: "civic-event-ops",
    title: "Community Event Operations Assistant",
    organization: "Civic Nights",
    sourceId: "community-board",
    sourceLabel: "Community board",
    sourceType: "community",
    location: "San Leandro, CA",
    remotePolicy: "local",
    kind: "contract",
    experienceLevel: "growing",
    compensation: "$900 weekend contract",
    compensationValue: 69,
    urgencyScore: 95,
    category: "Events & Programs",
    summary:
      "Help run neighborhood events, volunteer check-in, and sponsor communication for a busy summer calendar.",
    responsibilities: [
      "Track setup lists and volunteer assignments",
      "Communicate with vendors and sponsors",
      "Handle calm issue resolution during live events",
    ],
    qualifications: [
      "Event organization",
      "Comfort with moving parts",
      "Strong communication under pressure",
    ],
    skills: [
      "event coordination",
      "vendor communication",
      "checklists",
      "volunteer support",
      "calm problem solving",
    ],
    tags: ["local", "urgent", "seasonal", "experience builder"],
  },
];
