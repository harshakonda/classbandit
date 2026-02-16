// ============================================================
// CLASSBANDIT — App Configuration & Data
// ============================================================

export const PETS: Record<string, { id: string; name: string; species: string; images: Record<string, string> }> = {
  pet1: {
    id: "pet1", name: "Bandit", species: "hamster",
    images: {
      standing: "/pets/pet1-standing.png",
      celebrate: "/pets/pet1-celebrate.png",
      normal: "/pets/pet1-normal.jpg",
      sleep: "/pets/pet1-sleep.jpg",
      blink1: "/pets/pet1-blink1.jpg",
      blink2: "/pets/pet1-blink2.jpg",
    },
  },
  pet2: {
    id: "pet2", name: "Blossom", species: "hamster",
    images: { standing: "/pets/pet2.jpg", normal: "/pets/pet2.jpg" },
  },
};

export const ICONS = {
  food: "/icons/food.png",
  water: "/icons/water.png",
  clean: "/icons/clean.png",
  treasureChest: "/icons/treasure-chest.png",
  handHeart: "/icons/hand-heart.png",
  cageBg: "/images/cage-bg.png",
  logo: "/images/logo.jpg",
};

export type CaselCategory = "Self-Management" | "Responsible Decision-Making" | "Social Awareness" | "Relationship Skills" | "Self-Awareness";

export const CASEL_COLORS: Record<CaselCategory, string> = {
  "Self-Management": "#007AFF",
  "Responsible Decision-Making": "#E91E63",
  "Social Awareness": "#4CAF50",
  "Relationship Skills": "#FF9800",
  "Self-Awareness": "#9C27B0",
};

export const GOAL_LIBRARY = [
  { id: "gt1", title: "Staying on task", casel: "Self-Management" as CaselCategory },
  { id: "gt2", title: "Showing self-discipline", casel: "Self-Management" as CaselCategory },
  { id: "gt3", title: "Taking responsibility", casel: "Responsible Decision-Making" as CaselCategory },
  { id: "gt4", title: "Making good choices", casel: "Responsible Decision-Making" as CaselCategory },
  { id: "gt5", title: "Showing empathy", casel: "Social Awareness" as CaselCategory },
  { id: "gt6", title: "Understanding different perspectives", casel: "Social Awareness" as CaselCategory },
  { id: "gt7", title: "Working together", casel: "Relationship Skills" as CaselCategory },
  { id: "gt8", title: "Helping others", casel: "Relationship Skills" as CaselCategory },
  { id: "gt9", title: "Resolving conflicts peacefully", casel: "Relationship Skills" as CaselCategory },
  { id: "gt10", title: "Communicating effectively", casel: "Relationship Skills" as CaselCategory },
  { id: "gt11", title: "Managing stress", casel: "Self-Management" as CaselCategory },
  { id: "gt12", title: "Setting goals", casel: "Self-Management" as CaselCategory },
  { id: "gt13", title: "Respecting others", casel: "Social Awareness" as CaselCategory },
  { id: "gt14", title: "Appreciating diversity", casel: "Social Awareness" as CaselCategory },
  { id: "gt15", title: "Problem-solving", casel: "Responsible Decision-Making" as CaselCategory },
  { id: "gt16", title: "Thinking before acting", casel: "Responsible Decision-Making" as CaselCategory },
  { id: "gt17", title: "Understanding personal values", casel: "Self-Awareness" as CaselCategory },
  { id: "gt18", title: "Identifying emotions", casel: "Self-Awareness" as CaselCategory },
  { id: "gt19", title: "Recognizing strengths", casel: "Self-Awareness" as CaselCategory },
];

export const POINTS_PER_LEVEL = 25;

export const LEVEL_REWARDS = [
  { level: 1, title: "Backpack", description: "A trusty backpack for adventures", icon: "\uD83C\uDF92" },
  { level: 2, title: "Cool Hat", description: "Looking stylish!", icon: "\uD83E\uDDE2" },
  { level: 3, title: "Guitar", description: "Time to rock!", icon: "\uD83C\uDFB8" },
  { level: 4, title: "Skateboard", description: "Zoom zoom!", icon: "\uD83D\uDEF9" },
  { level: 5, title: "Cape", description: "Superhero mode!", icon: "\uD83E\uDDB8" },
];

export const REFLECT_ITEMS = [
  { id: "r1", title: "Reflection Questions", icon: "\uD83D\uDCAD" },
  { id: "r2", title: "Breathe", icon: "\uD83C\uDF2C\uFE0F" },
  { id: "r3", title: "Guided Meditation", icon: "\uD83E\uDDD8" },
];

export const CHECK_IN_CATEGORIES = [
  { id: "energy", title: "Energy Check", prompt: "Let's take a minute to check-in with ourselves. How are you feeling right now?", followUp: "What can we do to make ourselves ready to learn for the rest of the day?" },
  { id: "midday", title: "Midday Reset", prompt: "It's time for a midday check-in. How is everyone doing?", followUp: "What's one thing we can do to finish the day strong?" },
  { id: "turnaround", title: "Turn It Around", prompt: "Let's pause and think about how things are going. How are we feeling?", followUp: "What can we change to make the rest of our day better?" },
  { id: "celebration", title: "Celebration", prompt: "We've been working hard! How are we feeling about what we've accomplished?", followUp: "What are we most proud of today?" },
];

export const EMOTIONS_UI = [
  { label: "Happy", color: "#FBBF24", emoji: "\uD83D\uDE0A" },
  { label: "Calm", color: "#60A5FA", emoji: "\uD83D\uDE0C" },
  { label: "Okay", color: "#A78BFA", emoji: "\uD83D\uDE42" },
  { label: "Tired", color: "#F87171", emoji: "\uD83D\uDE34" },
  { label: "Worried", color: "#FB923C", emoji: "\uD83D\uDE1F" },
];

// dialogPos: where the instruction box appears (center, bottomRight, bottomLeft, topRight, midRight)
// petPos: where the pet stands (center, bottomRight, bottomLeft, midLeft, midRight)
export const TUTORIAL_STEPS = [
  { id: 0, title: "[Name] is now a part of our classroom community!", body: "We'll need to earn points as a class to care for [Name]. Let's learn how to do that!", bullets: null, buttonText: "Continue", highlight: null, dialogPos: "center", petPos: "center" },
  { id: 1, title: "Every day, we help [Name] stay healthy!", body: "", bullets: ["\uD83E\uDD55 Feed once a day (+1 point)", "\uD83D\uDCA7 Give water once a day (+1 point)"], buttonText: "Next", highlight: "feed", dialogPos: "midRight", petPos: "bottomRight" },
  { id: 2, title: "Once a week, we help [Name] stay clean!", body: "", bullets: ["\u2728 Clean the cage (+1 point)"], buttonText: "Next", highlight: "clean", dialogPos: "midRight", petPos: "bottomRight" },
  { id: 3, title: "When we take care of [Name], he feels happy and strong.\nBut that\u2019s not all...", body: "", buttonText: "How to earn points", highlight: null, dialogPos: "midRight", petPos: "midLeft" },
  { id: 4, title: "How to earn points", body: "When we work together and meet our class goals, we earn class points!\n\nThe more points we earn, the more fun things we unlock for [Name]!", buttonText: "See levels and rewards", highlight: "goals", dialogPos: "midRight", petPos: "bottomRight" },
  { id: 5, title: "Growing and Unlocking Rewards", body: "Every time we earn 25 points, [Name] levels up!\n\nWhen we level up, we unlock:\n\u2022 \u2B50 New accessories\n\u2022 \uD83C\uDFE0 New things for [Name]'s home\n\u2022 \uD83C\uDF89 Special class rewards\n\nFor big levels, we can choose special class celebrations to work toward!", buttonText: "How reflection helps us grow", highlight: "awards", dialogPos: "midRight", petPos: "bottomCenter" },
  { id: 6, title: "Reflect and Grow Together", body: "Sometimes we pause to check in and think about how we're doing as a class.\n\nReflection helps us:\n\u2022 Notice what's going well\n\u2022 Fix problems\n\u2022 Work together better\n\nWhen we reflect and grow, we reach our goals faster!", buttonText: "Next", highlight: "reflect", dialogPos: "midRight", petPos: "bottomCenter" },
  { id: 7, title: "Welcome to our class, [Name]!", body: "Let's have a great day and start earning some points!", buttonText: "Let's go!", highlight: null, dialogPos: "center", petPos: "centerInDialog" },
];

export const GRADE_OPTIONS = ["PreK", "K", "1", "2", "3", "4", "5"];

export function gradeName(level: number | string): string {
  const map: Record<string, string> = { "PreK": "Pre-K", "K": "Kindergarten", "0": "Pre-K", "1": "First Grade", "2": "Second Grade", "3": "Third Grade", "4": "Fourth Grade", "5": "Fifth Grade" };
  return map[String(level)] || `Grade ${level}`;
}
