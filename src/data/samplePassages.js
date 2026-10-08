/**
 * Pre-loaded sample reading passages for the Dyslexia Assistant Reader.
 * Kept in a separate file so Reader.jsx only exports a React component,
 * satisfying Vite's React Fast Refresh constraint.
 */
export const SAMPLE_PASSAGES = [
  {
    id: 'science',
    title: 'Oceanic Bioluminescence',
    category: 'Science',
    text: `Deep beneath the ocean surface, where sunlight never pierces the gloom, creatures create their own living light. This phenomenon is called bioluminescence. Tiny lanternfish flash radiant blue patterns along their bellies to blend with the dim surface glow, while the crystal jellyfish radiates emerald pulses through its transparent dome. Biochemical reactions involving luciferin and oxygen ignite without wasting heat, proving that nature is the most efficient lighting engineer on Earth.`
  },
  {
    id: 'fiction',
    title: 'The Clockwork Compass',
    category: 'Fiction',
    text: `The clockwork compass didn't point toward the magnetic north; it pointed toward wherever you were most afraid to go. Kael tightened his leather straps as the brass needle twitched violently, humming with a frequency that resonated in his teeth. Beneath the ancient cogwheels of Eldoria, steam hissed through rusted valves, and the great bronze gears of the chronometer turned with the slow, deliberate inevitability of forgotten time.`
  },
  {
    id: 'history',
    title: 'The Library of Alexandria',
    category: 'History',
    text: `Over two thousand years ago on the sun-drenched Mediterranean coast, the Great Library of Alexandria attempted something unprecedented: gathering every manuscript, scroll, and translation in the known world under a single vaulted roof. Scholars from Athens, Memphis, and Babylon walked through marble peristyles, cataloging celestial charts and Euclid's geometry. Even as empires rose and crumbled, the thirst to preserve human curiosity burned brighter than the Pharos lighthouse itself.`
  },
  {
    id: 'mindfulness',
    title: 'The Forest Canopy Breath',
    category: 'Mindfulness',
    text: `Take a gentle, quiet breath in through your nose, feeling the cool air fill the upper canopy of your chest. As you breathe out, imagine the tension melting down through your shoulders like morning dew sliding off mossy bark. There is no rush to finish this sentence. Your eyes are free to rest on any word for as long as they need. You are present, steady, and completely capable.`
  }
];
