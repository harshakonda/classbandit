// ============================================================
// CLASSBANDIT — App Configuration & Data
// ============================================================

export const PETS: Record<string, { id: string; name: string; species: string; images: Record<string, string> }> = {
  pet1: {
    id: "pet1", name: "Bandit", species: "hamster",
    images: {
      standing: "/pets/pet-hero.png",
      neutral: "/pets/pet1-neutral.svg",
      happyOne: "/pets/pet1-happy-noband.svg",
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
  logo: "/images/logo.png",
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
  { level: 1, pointsRequired: 25, id: "mask", title: "Adventure Mask", description: "A cool mask for brave adventures!", icon: "/pets/mask-icon.svg",
    petImages: { standing: "/pets/pet1-mask-standing.svg", happyOne: "/pets/pet1-mask-happy.svg", neutral: "/pets/pet1-mask-happy.svg" } },
  { level: 2, pointsRequired: 50, id: "scarf", title: "Cozy Scarf", description: "A warm purple scarf for chilly days!", icon: "/pets/scarf-icon.svg",
    petImages: { standing: "/pets/pet1-scarf-happy.svg", happyOne: "/pets/pet1-scarf-happy.svg", neutral: "/pets/pet1-scarf-happy.svg" } },
  { level: 3, pointsRequired: 75, id: "backpack", title: "Backpack", description: "A trusty backpack for adventures", icon: "", petImages: null },
  { level: 4, pointsRequired: 100, id: "skateboard", title: "Skateboard", description: "Zoom zoom!", icon: "", petImages: null },
];

export const REFLECT_CATEGORIES = [
  {
    id: "checkin", title: "Check-In", icon: "/icons/reflect-checkin.svg",
    topics: [
      { id: "energy", title: "Energy Check", subtitle: "Let's check in with ourselves...", prompt: "Let's take a minute to check-in with ourselves. How are you feeling right now?", followUp: "What can we do to make ourselves ready to learn for the rest of the day?" },
      { id: "midday", title: "Mid-day Check-in", subtitle: "How is everyone doing halfway through the day?", prompt: "It's time for a midday check-in. How is everyone doing?", followUp: "What's one thing we can do to finish the day strong?" },
    ],
  },
  {
    id: "bigfeelings", title: "Big Feelings", icon: "/icons/reflect-bigfeelings.svg",
    topics: [
      { id: "heavy", title: "Big, Heavy Emotions", subtitle: "Let's notice, name, and calm big feelings together.", prompt: "Sometimes we have really big feelings. Let's talk about them. How are you feeling right now?", followUp: "What can we do to help ourselves when we have big feelings?" },
      { id: "goodfeelings", title: "Keep the Good Feelings Going", subtitle: "What made you feel happy or proud in class today?", prompt: "What made you feel happy or proud in class today?", followUp: "How can we keep these good feelings going?" },
      { id: "frustrated", title: "Frustrated to Focused", subtitle: "What made something feel frustrating today?", prompt: "What made something feel frustrating today?", followUp: "What can we do to turn frustration into focus?" },
    ],
  },
  {
    id: "hardthings", title: "Doing Hard Things", icon: "/icons/reflect-hardthings.svg",
    topics: [
      { id: "persevere", title: "Persevering", subtitle: "Getting ready for something hard.", prompt: "Sometimes things are hard, but we can keep going. What's something hard you've been working on?", followUp: "What helps you keep going when things are tough?" },
      { id: "progress", title: "Practice Makes Progress", subtitle: "What skill are you working to improve?", prompt: "What skill are you working to improve?", followUp: "How has practice helped you get better?" },
    ],
  },
  {
    id: "understanding", title: "Understanding Each Other", icon: "/icons/reflect-understanding.svg",
    topics: [
      { id: "listening", title: "Listening Better", subtitle: "What does good listening look like?", prompt: "What does good listening look like?", followUp: "How can we be better listeners for each other?" },
      { id: "included", title: "Being Included", subtitle: "What does it feel like to be left out?", prompt: "What does it feel like to be left out?", followUp: "What can we do to make sure everyone feels included?" },
      { id: "repairing", title: "Repairing a Problem", subtitle: "What is a problem we sometimes have in the classroom?", prompt: "What is a problem we sometimes have in the classroom?", followUp: "What can we do to fix it together?" },
    ],
  },
  {
    id: "working", title: "Working Together", icon: "/icons/reflect-working.svg",
    topics: [
      { id: "whatwentwell", title: "What Went Well", subtitle: "What helped us succeed?", prompt: "What helped us succeed today?", followUp: "How can we keep doing what works?" },
      { id: "strongteams", title: "Strong Teams", subtitle: "What makes a strong team?", prompt: "What makes a strong team?", followUp: "How can we be an even stronger team?" },
      { id: "helpingeach", title: "Helping Each Other", subtitle: "When did someone help you this week?", prompt: "When did someone help you this week?", followUp: "How did it make you feel when someone helped you?" },
    ],
  },
  {
    id: "choices", title: "Making Smart Choices", icon: "/icons/reflect-choices.svg",
    topics: [
      { id: "betternext", title: "Better Next Time", subtitle: "Looks like we are having a bit of trouble today...", prompt: "Looks like we are having a bit of trouble today. What can we do better next time?", followUp: "What's one thing we can all commit to?" },
      { id: "thinkahead", title: "Think Ahead", subtitle: "What are possible choices we can make?", prompt: "What are possible choices we can make?", followUp: "How can thinking ahead help us make better choices?" },
    ],
  },
];

export type ReflectTopic = typeof REFLECT_CATEGORIES[number]["topics"][number];

// Keep old exports for backward compatibility but mark as deprecated
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
  { label: "Excited", color: "#F59E0B", emoji: "\uD83E\uDD29" },
  { label: "Grateful", color: "#60A5FA", emoji: "\uD83E\uDD79" },
  { label: "Sad", color: "#F87171", emoji: "\uD83D\uDE22" },
  { label: "Nervous", color: "#FB923C", emoji: "\uD83D\uDE1F" },
];

// dialogPos: where the instruction box appears (center, bottomRight, bottomLeft, topRight, midRight)
// petPos: where the pet stands (center, bottomRight, bottomLeft, midLeft, midRight)
export const TUTORIAL_STEPS = [
  { id: 0, title: "[Name] is now a part of our classroom community!", body: "We'll need to earn points as a class to care for [Name]. Let's learn how to do that!", bullets: null, buttonText: "Continue", highlight: null, dialogPos: "centerLeft", petPos: "center" },
  { id: 1, title: "Every day, we help [Name] stay healthy!", body: "", bullets: ["\uD83E\uDD55 Feed once a day (+1 point)", "\uD83D\uDCA7 Give water once a day (+1 point)"], buttonText: "Next", highlight: "feed", dialogPos: "midRight", petPos: "bottomLeft" },
  { id: 2, title: "Once a week, we help [Name] stay clean!", body: "", bullets: ["\u2728 Clean the cage (+1 point)"], buttonText: "Next", highlight: "clean", dialogPos: "midRight", petPos: "bottomLeft" },
  { id: 3, title: "When we take care of [Name], he feels happy and strong.\nBut that\u2019s not all...", body: "", buttonText: "How to earn points", highlight: null, dialogPos: "center", petPos: "midLeft" },
  { id: 4, title: "How to earn points", body: "When we work together and meet our class goals, we earn class points!\n\nThe more points we earn, the more fun things we unlock for [Name]!", buttonText: "See levels and rewards", highlight: "goals", dialogPos: "centerLeft", petPos: "bottomLeft" },
  { id: 5, title: "Growing and Unlocking Rewards", body: "Every time we earn 25 points, [Name] levels up!\n\nWhen we level up, we unlock:\n\u2022 \u2B50 New accessories\n\u2022 \uD83C\uDFE0 New things for [Name]'s home\n\u2022 \uD83C\uDF89 Special class rewards\n\nFor big levels, we can choose special class celebrations to work toward!", buttonText: "How reflection helps us grow", highlight: "awards", dialogPos: "center", petPos: "bottomLeft" },
  { id: 6, title: "Reflect and Grow Together", body: "Sometimes we pause to check in and think about how we're doing as a class.\n\nReflection helps us:\n\u2022 Notice what's going well\n\u2022 Fix problems\n\u2022 Work together better\n\nWhen we reflect and grow, we reach our goals faster!", buttonText: "Next", highlight: "reflect", dialogPos: "centerLeft", petPos: "bottomLeft" },
  { id: 7, title: "Welcome to our class, [Name]!", body: "Let's have a great day and start earning some points!", buttonText: "Let's go!", highlight: null, dialogPos: "center", petPos: "centerInDialog" },
];

export const GRADE_OPTIONS = ["PreK", "K", "1", "2", "3", "4", "5"];

export function gradeName(level: number | string): string {
  const map: Record<string, string> = { "PreK": "Pre-K", "K": "Kindergarten", "0": "Pre-K", "1": "First Grade", "2": "Second Grade", "3": "Third Grade", "4": "Fourth Grade", "5": "Fifth Grade" };
  return map[String(level)] || `Grade ${level}`;
}
