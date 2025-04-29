import { GameRoastMapping } from '../types/gameRoast';

/**
 * Collection of roast phrases for different games
 * Organized by game name (lowercase) for easy lookup
 */
export const GAME_ROASTS: GameRoastMapping = {
  'league of legends': [
    'Time to feed mid lane, I see.',
    'Another day, another ragequit after first blood.',
    "Let me guess: 'My team is holding me back'?",
    "I hope you bought RP for that skin because it won't improve your skills.",
    "Your CS is probably lower than your IQ... and that's saying something.",
    "Hope you're good at explaining why you died to minions again.",
  ],
  lol: [
    "Oh look, midlane's about to be fed again.",
    'Warning: Ranked games may cause keyboard damage.',
    'Your KDA looks like a phone number... mostly zeros.',
    'Is it a good strategy to be the ward for the enemy team?',
    'You ping missing more than you hit skillshots.',
    "Ah, I see you've selected 'Autopilot' as your playstyle today.",
  ],
  valorant: [
    'Another day, another missed headshot.',
    'I can already hear you blaming your ping.',
    "You're so predictable the enemy team is pre-aiming your positions.",
    'Your aim is as consistent as your excuses.',
    "Standing still isn't a valid strategy, you know.",
    "Let me guess, you're an 'aggressive support' who never plants?",
  ],
  fortnite: [
    "Building a tower won't hide your poor aim.",
    "Cranking 90s won't save you from your decision-making.",
    'Your building skills are great! Your shooting though...',
    "Thank the bus driver, because that's the only kill you'll get.",
    "Nice skin! It'll look great in the spectator mode you'll spend most time in.",
    "Is 'get eliminated instantly' your go-to strategy?",
  ],
  rust: [
    'Enjoy respawning naked again!',
    'Your base probably has more holes than your gameplay.',
    'Time to farm for hours just to lose it all in seconds!',
    'Door campers have more strategy than you.',
    "Even your teammates don't trust you with the good loot.",
    "Your aim is like Rust's optimization - inconsistent at best.",
  ],
  minecraft: [
    'Mining straight down is still your go-to strategy?',
    'Your builds look like creeper accidents.',
    'Even villagers make better life choices than you.',
    'Let me guess, you still scream when you hear a cave sound?',
    'Your redstone contraptions probably have more logic than your gameplay.',
    'Even zombies have better pathfinding than you.',
  ],
  'apex legends': [
    'First one to die, first one to blame teammates.',
    'Hot dropping solo? How original.',
    "Positioning is key, but you wouldn't know about that.",
    'Your aim tracking is like my grandma trying to use a smartphone.',
    'Careful not to break your back carrying all those excuses.',
    'Even the training dummies have higher damage stats.',
  ],
  'counter-strike': [
    'Stop blaming your gaming chair for your aim.',
    'Have you tried shooting the enemy instead of the wall?',
    'Rush B but never rush objectives in real life, right?',
    'You peek AWP angles like you want to be sent back to spawn.',
    "Your spray control looks like you're drawing modern art.",
    'Ever heard of an eco round? Your bank account needs one.',
  ],
  cs2: [
    'Stop blaming your gaming chair for your aim.',
    'Have you tried shooting the enemy instead of the wall?',
    'Rush B but never rush objectives in real life, right?',
    'You peek AWP angles like you want to be sent back to spawn.',
    "Your spray control looks like you're drawing modern art.",
    'Ever heard of an eco round? Your bank account needs one.',
  ],
  'rocket league': [
    'Nice flip reset! Did you mean to hit the ceiling?',
    'You rotate less than a broken swivel chair.',
    "Your aerials look like you're playing with a steering wheel.",
    "Calculated? The only calculation is how fast you'll blame teammates.",
    'Your boost management is like your life decisions - nonexistent.',
    "What's your excuse today? Controller drift or lag?",
  ],
  fifa: [
    "Is 'through ball spam' the only tactic you know?",
    'Your defending is more open than an all-you-can-eat buffet.',
    "I see you're taking the 'concede first, panic later' approach again.",
    "Your skill moves look like you're having a seizure with the controller.",
    "Blaming scripting won't fix your inability to finish chances.",
    'Weekend League? More like Weekend Rage.',
  ],
  'dota 2': [
    'Missing more last hits than a stormtrooper.',
    'Your map awareness is as nonexistent as your social life.',
    'Buying wards is apparently more expensive than your life.',
    'You farm heroes about as well as a pacifist farms creeps.',
    'Your positioning is why the enemy carry has a divine rapier at 20 minutes.',
    'Do you intentionally feed or is that just your natural playstyle?',
  ],
  'dead by daylight': [
    "Urban Evasion won't hide how bad you are at looping.",
    'Camping hooks is your personality trait.',
    'Getting face-camped again? Must be your magnetic personality.',
    'Your gen efficiency is lower than my expectations.',
    "I'm surprised the entity hasn't fired you yet.",
    'Self-caring in the corner while teammates die? Classic.',
  ],
  'rainbow six siege': [
    'Ah yes, reinforce between sites. Big brain time.',
    'Your aim is why Rook always brings extra plates.',
    "You're the reason your team needs a Thunderbird.",
    "Leaning left and right won't improve your aim.",
    "Spawn peeking is the only kill you'll get all match.",
    'Sound whoring and still getting flanked? Impressive.',
  ],
  'genshin impact': [
    'Your artifact RNG is still better than your decision making.',
    'Wallet impact at its finest.',
    'Your team comp makes less sense than the story.',
    'Resin management or life management - equally poor.',
    'F2P BTW (But still has all 5-stars somehow).',
    'You spend more time in character menus than actually playing.',
  ],
  overwatch: [
    'POTG: Pressing Q at the right time.',
    'Your aim is why Mercy mains exist.',
    "Switching heroes won't fix your game sense.",
    "You're the reason your team needs two supports.",
    'Tank diff? More like brain diff.',
    'Your positioning is why the enemy Widow has 100% scoped accuracy.',
  ],
  'overwatch 2': [
    'POTG: Pressing Q at the right time.',
    'Your aim is why Mercy mains exist.',
    "Switching heroes won't fix your game sense.",
    "You're the reason your team needs two supports.",
    'Tank diff? More like brain diff.',
    'Your positioning is why the enemy Widow has 100% scoped accuracy.',
  ],
  'world of warcraft': [
    'Still keyboard turning in 2023?',
    "Your DPS is lower than tank's self-healing.",
    'Standing in fire for the warming effect again?',
    'Your gear is better than your gameplay.',
    "You've died to the same mechanic four times now.",
    'Your rotation has more gaps than your raid attendance.',
  ],
  wow: [
    'Still keyboard turning in 2023?',
    "Your DPS is lower than tank's self-healing.",
    'Standing in fire for the warming effect again?',
    'Your gear is better than your gameplay.',
    "You've died to the same mechanic four times now.",
    'Your rotation has more gaps than your raid attendance.',
  ],
  // Generic roasts for any game
  default: [
    "Ah, I see you've chosen to disappoint in a new game today.",
    "Your gaming chair isn't the problem. You are.",
    "Taking 'it's just a game' to a whole new level of bad.",
    "You don't need better internet, you need better skills.",
    'Your gaming sessions should come with a trigger warning.',
    'Speedrunning your way to the bottom of the leaderboard again?',
    'Have you tried turning your skill on and off again?',
    'Your gaming history is like your browser history - best kept private.',
    'Even NPCs feel sorry for you.',
    "The loading screen is the only time you're not failing.",
  ],
};

/**
 * Gets roast phrases for a specific game
 * @param gameName Name of the game (will be converted to lowercase)
 * @returns Array of roast phrases
 */
export function getRoastsForGame(gameName: string): string[] {
  const normalizedGameName = gameName.toLowerCase();

  // Try to find exact match first
  if (GAME_ROASTS[normalizedGameName]) {
    return GAME_ROASTS[normalizedGameName];
  }

  // Check for partial matches (game name includes key or key includes game name)
  for (const [key, phrases] of Object.entries(GAME_ROASTS)) {
    if (
      key !== 'default' &&
      (normalizedGameName.includes(key) || key.includes(normalizedGameName))
    ) {
      return phrases;
    }
  }

  // Return default roasts if no match found
  return GAME_ROASTS.default;
}

/**
 * Gets a random roast phrase for the specified game
 * @param gameName Name of the game
 * @returns Random roast phrase
 */
export function getRandomRoastForGame(gameName: string): string {
  const phrases = getRoastsForGame(gameName);
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export default {
  GAME_ROASTS,
  getRoastsForGame,
  getRandomRoastForGame,
};
