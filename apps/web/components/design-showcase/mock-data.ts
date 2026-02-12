import { CodexEntry, Protagonist } from "@once/shared";

export const mockProtagonist: Protagonist = {
  id: 1,
  storyId: 1,
  name: "Aeliana Weaver",
  description:
    "A skilled weaver of light and shadow, seeking the lost loom of the ancients.",
  health: 75,
  energy: 40,
  currentLocation: "The Whispering Archives",
  baseTraits: ["Observant", "Agile", "Mystic"],
  currentTraits: ["Observant", "Agile", "Mystic", "Cursed (Mild)"],
  inventory: [
    "Spectral Lantern",
    "Ancient Key",
    "Weaver's Needle",
    "3x Star Shards",
    "Tattered Map",
  ],
  scars: ["Burn on left hand", "Shadow-touched"],
  isActive: true,
};

export const mockCodex: CodexEntry[] = [
  {
    id: 1,
    storyId: 1,
    entryType: "character",
    name: "Master Thorne",
    description:
      "The keeper of the archives. A stern but knowledgeable elder who guards the forbidden texts.",
    metadata: { role: "Mentor", status: "Alive" },
    firstMentionedSceneId: 1,
  },
  {
    id: 2,
    storyId: 1,
    entryType: "character",
    name: "The Shadow Broker",
    description: "An elusive figure who trades in secrets and stolen memories.",
    metadata: { role: "Antagonist", status: "Unknown" },
    firstMentionedSceneId: 3,
  },
  {
    id: 3,
    storyId: 1,
    entryType: "location",
    name: "The Whispering Archives",
    description:
      "A vast library where books whisper their contents to those who listen closely.",
    metadata: { dangerLevel: "Low", type: "Library" },
    firstMentionedSceneId: 1,
  },
  {
    id: 4,
    storyId: 1,
    entryType: "location",
    name: "Echoing Void",
    description: "A dimension of pure sound and reverberation.",
    metadata: { dangerLevel: "High", type: "Dimension" },
    firstMentionedSceneId: 5,
  },
  {
    id: 5,
    storyId: 1,
    entryType: "item",
    name: "Spectral Lantern",
    description: "Reveals hidden paths and spirits invisible to the naked eye.",
    metadata: { rarity: "Rare", power: "Illumination" },
    firstMentionedSceneId: 2,
  },
  {
    id: 6,
    storyId: 1,
    entryType: "concept",
    name: "Light Weaving",
    description: "The ancient art of manipulating light to create solid forms.",
    metadata: { difficulty: "Hard", origin: "Celestials" },
    firstMentionedSceneId: 1,
  },
];

export const mockStoryText = `
The Whispering Archives were silent, save for the soft rustle of paper as Aeliana turned the page. The ancient tome, bound in dragon scale, felt warm to the touch.

"Do you hear them?" Master Thorne's voice echoed from the shadows.

Aeliana nodded slowly. "They speak of the lost loom. Of threads that bind reality itself."

She raised the Spectral Lantern, its pale blue light cutting through the gloom. Dust motes danced in the beam, forming shapes that twisted and turned like phantoms.

"Be careful, child," the old man warned, stepping into the light. "The Shadow Broker seeks the same knowledge. And he does not share."

Aeliana touched the burn on her left hand, a reminder of their last encounter. "I know. But I have something he doesn't."

"And what is that?"

"Hope," she whispered, though she wasn't entirely sure she believed it herself.
`;
