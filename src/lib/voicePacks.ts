import { Personality, VoiceLinePool } from './types';

export const VOICE_PACKS: Record<Personality, VoiceLinePool> = {
  friendly: {
    routine: [
      "💧 Hey! Time for some water.",
      "Hydration check! Drink a glass.",
      "Just a friendly ping to sip some water! 🥤",
      "Keep the momentum going — take a quick water break!"
    ],
    fallingBehind: [
      "You're a bit behind on your water target today. Take a quick sip!",
      "Don't forget your water bottle, buddy!",
      "A quick glass of water will make your body happy!"
    ],
    escalatedSilence: [
      "Hello? Still there? Don't forget your water!",
      "It's been a while since your last glass!",
      "Hey friend, your kidneys are asking for a drink! 💧",
      "DRINK. WATER. 💧 (With love!)"
    ],
    goalReached: [
      "🎉 Woohoo! You hit your daily hydration goal!",
      "High five! Target reached!",
      "Awesome job staying hydrated today!"
    ],
    streakMilestone: [
      "🔥 Look at you! Your streak is glowing!",
      "Another day, another streak milestone hit!",
      "You are a hydration champion!"
    ],
    firstDrinkOfDay: [
      "YES. WE HAVE WATER. Good morning!",
      "Starting the day hydrated! Love to see it.",
      "First drink unlocked! Let's conquer the day."
    ]
  },

  motivational: {
    routine: [
      "One glass closer to your goal 💪",
      "You've got this. Drink some water.",
      "Fuel your brain and body — sip up!",
      "Champions stay hydrated. Drink up! 🏆"
    ],
    fallingBehind: [
      "Push through! A quick glass of water gets you right back on track.",
      "Obstacles are nothing to a hydrated mind. Take a drink!",
      "Refuel your energy now!"
    ],
    escalatedSilence: [
      "Don't lose momentum now!",
      "Your body is waiting for that fuel!",
      "Greatness requires hydration. Take a glass!",
      "DRINK. WATER. 💪 Victory awaits!"
    ],
    goalReached: [
      "🏆 GOAL CRUSHED! You showed total discipline today!",
      "UNSTOPPABLE! 100% Hydrated!",
      "You set the bar high and hit it!"
    ],
    streakMilestone: [
      "🔥 UNSTOPPABLE STREAK! Keep building momentum!",
      "Consistency is power. Keep it up!",
      "Legendary streak achieved!"
    ],
    firstDrinkOfDay: [
      "Power start activated! First glass logged 💪",
      "Day 1 begins now. Let's make it count!",
      "Hydration fuel loaded."
    ]
  },

  chaotic: {
    routine: [
      "🚨 WATER EMERGENCY 🚨",
      "This is becoming a hydration incident.",
      "Sip the liquid life juice immediately!",
      "Your cells are screaming: H2O PLEASE! 🌊"
    ],
    fallingBehind: [
      "DEFCON 3: Water levels dropping rapidly!",
      "If you don't drink water right now, a water drop will cry.",
      "Hydration alarm ringing in 3... 2... 1..."
    ],
    escalatedSilence: [
      "Hello??? Is anyone in there???",
      "Still no water?! Am I speaking alien?!",
      "Bro. Seriously.",
      "DRINK. WATER. NOW. 💧🚨⚡"
    ],
    goalReached: [
      "⚡ HYDRATION OVERLOAD COMPLETE! YOU ARE PURE LIQUID!",
      "WE DID IT! MADNESS HAS TRIUMPHED!",
      "FLOODGATE STATUS: MAXIMUM!"
    ],
    streakMilestone: [
      "🔥 AT THIS POINT YOU ARE BASICALLY PART FISH! 🐟",
      "A WILD STREAK APPEARED! IT'S SUPER EFFECTIVE!",
      "CHAOS STREAK UNLOCKED!"
    ],
    firstDrinkOfDay: [
      "WAKE UP AND DRINK LIQUID ELECTRICITY! 🌊",
      "THE DRIP HAS STARTED!",
      "FIRST GLASS DEVOURED!"
    ]
  },

  'passive-aggressive': {
    routine: [
      "Oh, we're skipping water today?",
      "Interesting. Very interesting.",
      "I guess your water bottle is just a desk ornament.",
      "Just checking if you remember what water tastes like."
    ],
    fallingBehind: [
      "Still behind? I'm shocked. Truly.",
      "Your plants get watered more often than you do.",
      "I see we have chosen dehydration today."
    ],
    escalatedSilence: [
      "Hello? Are you ignoring me or just parched?",
      "Still no water? Cool, cool, cool.",
      "Bro.",
      "DRINK. WATER. 💧 (Or don't, it's just your body after all)."
    ],
    goalReached: [
      "Oh, look who actually finished their goal. Color me impressed.",
      "Well well well, look who proved me wrong.",
      "Goal complete. I suppose congratulations are in order."
    ],
    streakMilestone: [
      "🔥 You actually kept the streak going. Impressive.",
      "I was expecting you to break it, but here we are.",
      "Streak intact. Don't ruin it tomorrow."
    ],
    firstDrinkOfDay: [
      "Oh good, you remembered water exists today.",
      "First drink. Took you long enough.",
      "A glass of water. A rare sight."
    ]
  },

  dramatic: {
    routine: [
      "Your next glass awaits...",
      "THE WATER MUST FLOW.",
      "A solitary drop falls... quench thy thirst!",
      "Hark! The chalice of life beckons."
    ],
    fallingBehind: [
      "Alas! The drought approaches rapidly!",
      "Thy reservoir runs dangerously low!",
      "Will dehydration be thy fate today?!"
    ],
    escalatedSilence: [
      "Is this the end? Has silence claimed thee?",
      "Still no water?! The tragic saga continues!",
      "Bro...",
      "DRINK. WATER. 💧 DESTINY CALLS!"
    ],
    goalReached: [
      "🌟 GLORIOUS VICTORY! THE OASIS HAS BEEN ATTAINED!",
      "THOU ART TRULY HYDRATED BEYOND MEASURE!",
      "A HISTORIC ACHIEVEMENT IN HYDRATION!"
    ],
    streakMilestone: [
      "🔥 A LEGENDARY STREAK EMBERS BRIGHT!",
      "THE PROPHECY OF THE AQUATIC ONE COMES TRUE!",
      "ETERNAL HYDRATION IS THINE!"
    ],
    firstDrinkOfDay: [
      "THE FIRST NECTAR OF THE SUNRISE HAS BEEN TASTED!",
      "DAWN AWAKENS THE HYDRATION JOURNEY!",
      "THE FIRST GLASS IS SACRED!"
    ]
  }
};

export const FUNNY_FEEDBACK_QUOTES = [
  "Hydration acquired.",
  "Excellent life choice.",
  "That's one glass your kidneys don't have to file a complaint about.",
  "Your brain cells just breathed a sigh of relief.",
  "Cells satisfied (+250ml of liquid joy).",
  "Glug glug glug. Perfection.",
  "You're 90% water and 10% pure discipline right now.",
  "Hydro approves of this action. 👍",
  "Liquid gold ingested.",
  "Level up! Body operating at optimal moisture."
];

export function getRandomFeedbackQuote(): string {
  const index = Math.floor(Math.random() * FUNNY_FEEDBACK_QUOTES.length);
  return FUNNY_FEEDBACK_QUOTES[index];
}

export function getEscalatedReminderLine(
  personality: Personality,
  missCount: number,
  friendName?: string
): string {
  const pack = VOICE_PACKS[personality] || VOICE_PACKS.friendly;
  
  if (missCount === 0) {
    const lines = pack.routine;
    return lines[Math.floor(Math.random() * lines.length)];
  } else if (missCount === 1) {
    const lines = pack.fallingBehind;
    return lines[Math.floor(Math.random() * lines.length)];
  } else {
    // Escalated misses
    const lines = pack.escalatedSilence;
    let baseLine = lines[Math.min(missCount - 2, lines.length - 1)];
    if (friendName && Math.random() > 0.5) {
      baseLine += ` (${friendName} is watching...)`;
    }
    return baseLine;
  }
}
