/* ---------------------------------------------------------------
   IMAGINATION IS THE LAST CURRENCY -- vertical slice game data

   Structure: WORLD MAP -> ENTER REGION -> PLAY BOARD -> LAB BOSS -> WORLD MAP
   Each region is its own small node-network board with its own
   Signal deck draws (MOVE cards + special cards), not one long path.
--------------------------------------------------------------- */

export const NODE_TYPES = {
  START: { emoji: "🏁", label: "Start", color: "#5CFF8F" },
  SIGNAL: { emoji: "🟡", label: "Signal", color: "#FFD23C" },
  AWARENESS: { emoji: "👁️", label: "Awareness", color: "#FF4D5E" },
  TERMINAL: { emoji: "💻", label: "Terminal", color: "#B06BFF" },
  THINK: { emoji: "🧠", label: "Think", color: "#4BC9FF" },
  IMAGINATION: { emoji: "🌈", label: "Imagination", color: "#FF7BD1" },
  SNAKEOIL: { emoji: "🐍", label: "Snake Oil", color: "#FF8A3C" },
  CORRUPTION: { emoji: "⚠️", label: "Corruption", color: "#7A5CF0" },
  MYSTERY: { emoji: "❓", label: "Mystery", color: "#A7A1B8" },
  PORTAL: { emoji: "🌀", label: "Portal", color: "#9B5CFF" },
  BRANCH: { emoji: "🔀", label: "Branch", color: "#FFD23C" },
  LAB: { emoji: "🚪", label: "Lab Room", color: "#5CFF8F" },
};

/* Signal Card deck: plain MOVE cards (majority) + special cards that jump
   straight to the nearest matching node type still ahead on the resolved path. */
export const CARD_DECK = [
  { key: "MOVE1", label: "MOVE 1", weight: 4 },
  { key: "MOVE2", label: "MOVE 2", weight: 4 },
  { key: "MOVE3", label: "MOVE 3", weight: 3 },
  { key: "MOVE4", label: "MOVE 4", weight: 2 },
  { key: "IMAGINATION", label: "🌈 IMAGINATION", weight: 1, targetType: "IMAGINATION" },
  { key: "AWARENESS", label: "👁️ AWARENESS", weight: 1, targetType: "AWARENESS" },
  { key: "THINK", label: "🧠 THINK", weight: 1, targetType: "THINK" },
  { key: "CORRUPTION", label: "⚠️ CORRUPTION", weight: 1, targetType: "CORRUPTION" },
  { key: "SNAKEOIL", label: "🐍 SNAKE OIL", weight: 1, targetType: "SNAKEOIL" },
  { key: "PORTAL", label: "🌀 PORTAL", weight: 1, targetType: "PORTAL" },
  { key: "UNKNOWN", label: "❓ UNKNOWN", weight: 1, targetType: "MYSTERY" },
  { key: "BRANCH", label: "🔀 BRANCH", weight: 1, targetType: "BRANCH" },
];

/* ---------------------------------------------------------------
   WORLD MAP -- islands from the hand-drawn map
--------------------------------------------------------------- */

export const REGIONS = [
  { id: "waterpark", name: "Trip N Dream Waterpark", blurb: "Where the vacation began.", bg: "#BDEFFF", status: "story" },
  { id: "crystalcove", name: "Crystal Cove", blurb: "The last calm shoreline before the machine.", bg: "#C9B79C", status: "story" },
  { id: "wildchild", name: "Wild Child Island", blurb: "\"ATOM. LEAVE WILD CHILD ISLAND.\" -- restricted, not yet cleared.", bg: "#141018", status: "locked" },
  { id: "etherville", name: "Etherville", blurb: "AI isn't magic.", bg: "#6BD46B", status: "playable" },
  { id: "eyelandia", name: "Eyelandia", blurb: "The AI is examining you too.", bg: "#D9C9EA", status: "playable" },
  { id: "neuralfam", name: "Family of Neural Networks", blurb: "Different systems, different capabilities.", bg: "#EAD9A8", status: "comingsoon" },
  { id: "eternityportal", name: "Eternity Portal", blurb: "The final act. Not yet charted.", bg: "#8C93A6", status: "comingsoon" },
  { id: "memorylane", name: "Memory Lane", blurb: "Past, present, future.", bg: "#F0B7A4", status: "comingsoon" },
  { id: "dopaminemachine", name: "Dopamine Machine", blurb: "What gets rewarded gets repeated.", bg: "#3E5A2E", status: "comingsoon" },
  { id: "lavashake", name: "Lava Shake Hills", blurb: "Volatile outputs, unstable systems.", bg: "#5B3A24", status: "comingsoon" },
];

/* ---------------------------------------------------------------
   TRAINING FACILITY -- tutorial (pre-board)
--------------------------------------------------------------- */

export const TRAINING_CHIPS = {
  goal: [
    { text: "Make me successful.", good: false },
    { text: "Write me a 3-step plan to launch a lemonade stand this weekend.", good: true },
  ],
  context: [
    { text: "(skip)", good: false },
    { text: "I'm a total beginner with $20 and one afternoon.", good: true },
  ],
  constraints: [
    { text: "(skip)", good: false },
    { text: "Nothing that requires a car or a permit.", good: true },
  ],
  output: [
    { text: "(skip)", good: false },
    { text: "Give me a numbered list I can follow in order.", good: true },
  ],
};

/* ---------------------------------------------------------------
   ETHERVILLE BOARD -- "AI isn't magic."
   Start -> Terminal Go-Kart -> Prompt Space -> Context Challenge ->
   Hallucinating Robot -> BRANCH -> Computer Factory -> LAB (boss)
--------------------------------------------------------------- */

const ETHERVILLE_BOARD = {
  id: "etherville",
  name: "Etherville",
  tagline: "AI isn't magic. It's a machine you can learn to read.",
  unlock: { key: "prompting", label: "🎯 PROMPTING" },
  beforeBranch: [
    { id: "eth-start", type: "START", name: "Static Street", text: "Etherville hums to life -- retro terminals, glowing wires, a town built entirely out of old computers." },
    {
      id: "eth-terminal1", type: "TERMINAL", name: "Terminal Go-Kart Lot",
      intro: "A dashboard-on-wheels waits for instructions. Get it to the fuel station without instructions so vague it just... sits there.",
      categories: {
        goal: [{ text: "Go over there.", good: false }, { text: "Drive to the fuel station two blocks north.", good: true }],
        context: [{ text: "(skip)", good: false }, { text: "The road is narrow and there are pedestrians crossing.", good: true }],
        instructions: [{ text: "(skip)", good: false }, { text: "Stay on the road and yield at the crossing.", good: true }],
        constraints: [{ text: "(skip)", good: false }, { text: "Do not exceed a slow crawl near pedestrians.", good: true }],
        output: [{ text: "(skip)", good: false }, { text: "Stop directly at the pump.", good: true, imagination: true }],
      },
      fail: "The kart rolls two feet, decides that's 'over there,' and shuts off.",
      partial: "The kart gets to the station, clips a mailbox, and stops close enough to count.",
      success: "The kart glides to the fuel station, yields perfectly at the crossing, and parks right at the pump.",
    },
    {
      id: "eth-signal1", type: "SIGNAL", name: "Prompt Space",
      text: "A sign flickers: MICRO CHALLENGE -- which instruction gets a better result?",
      options: [
        { text: "\"Make it good.\"", correct: false },
        { text: "\"Make the headline under 8 words and mention the sale ends Friday.\"", correct: true },
      ],
      lesson: "SPECIFICITY CREATES CONTROL.",
      reward: { stat: "thinking", amount: 1 },
    },
    {
      id: "eth-think1", type: "THINK", name: "Context Challenge",
      prompt: "No AI here. A courier needs the fastest route across town but the bridge is out. What do you tell them?",
      options: [
        { text: "\"Just go the usual way.\"", correct: false },
        { text: "\"Take Static Street to 5th, then loop around the closed bridge via the market road.\"", correct: true },
        { text: "\"AI will figure it out.\"", correct: false },
      ],
      successText: "The courier nods -- that's a real route, not a hope.",
      failText: "The courier stares at the bridge that is, in fact, still out.",
      lesson: "SOME PROBLEMS JUST NEED YOU TO THINK IT THROUGH.",
    },
    {
      id: "eth-awareness1", type: "AWARENESS", name: "Hallucinating Robot",
      speaker: "A cheerful tour-guide robot, extremely sure of itself",
      claim: "\"Etherville was founded in the year 1974 by the inventor of the sun.\"",
      confidence: "It says this with 97% confidence and a friendly wave.",
      truth: "Etherville wasn't founded, it was compiled -- and nobody invented the sun. The robot is fluent, not correct.",
      trustConsequence: "You repeat the fact to a passing NPC, who looks at you like you've lost it.",
      verifyConsequence: "You check the town archive plaque instead. It says something completely different -- and true.",
      lesson: "CONFIDENCE ≠ CORRECTNESS.",
    },
  ],
  branch: {
    id: "eth-branch",
    prompt: "The road forks past the archive. Brainco offers: AUTO-COMPLETE THIS AREA?",
    options: [
      {
        key: "fast", label: "Fast Path", desc: "3 spaces skipped. Less information, less reward.",
        afterNodes: [
          { id: "eth-fast1", type: "SIGNAL", name: "Shortcut Alley", text: "You blaze through. Faster, sure. You couldn't say what you passed.", reward: { stat: "imagination", amount: 0 } },
        ],
      },
      {
        key: "awareness", label: "Awareness Path", desc: "More spaces. More challenges, more reward.",
        afterNodes: [
          {
            id: "eth-snake1", type: "SNAKEOIL", name: "Roadside Salesman",
            headline: "ONE PROMPT TO NEVER DRIVE AGAIN!",
            body: "A grinning salesman-bot leans out of a booth built from spare go-kart parts.",
            claims: [
              { text: "\"This upgrade lets the kart follow simple routes automatically.\"", manipulative: false },
              { text: "\"Never check the road again -- full trust, zero effort, guaranteed!\"", manipulative: true },
              { text: "\"Works best on routes you've mapped out yourself.\"", manipulative: false },
            ],
            correctIndex: 1,
            successText: "You spot the \"never check again\" pitch for what it is and keep your hands on the wheel.",
            failText: "You almost buy in before catching yourself. The salesman shrugs and resets his sign.",
            lesson: "\"NEVER THINK AGAIN\" IS A PITCH, NOT A FEATURE.",
          },
          {
            id: "eth-corrupt1", type: "CORRUPTION", name: "Glitching Billboard",
            headline: "SIGNAL INSTABILITY",
            body: "A billboard flickers between three versions of the same ad, each a little more confident than the facts support.",
            claims: [
              { text: "\"Results may vary based on your specific instructions.\"", manipulative: false },
              { text: "\"Everyone who tries this becomes an expert instantly.\"", manipulative: true },
              { text: "\"See the terminal operator for a walkthrough.\"", manipulative: false },
            ],
            correctIndex: 1,
            successText: "The 'instant expert' line doesn't survive a second look. You flag it and move on.",
            failText: "You shrug it off without naming it. The billboard flickers a little brighter.",
            lesson: "A CLAIM WITH NO EFFORT AND NO EXCEPTIONS IS WORTH A SECOND LOOK.",
          },
        ],
      },
      {
        key: "imagination", label: "Imagination Path", desc: "???",
        afterNodes: [
          {
            id: "eth-mystery1", type: "IMAGINATION", name: "???",
            text: "Off the map entirely, you find a terminal nobody's used in years, still logging a single repeating question: 'What would you build if nothing told you what to build?' You leave an answer only you will ever read.",
            reward: { stat: "imagination", amount: 3 },
          },
        ],
      },
    ],
  },
  converge: [
    {
      id: "eth-terminal2", type: "TERMINAL", name: "Computer Factory",
      intro: "Rows of assembly-bots wait on the line. Tell one exactly what to build so it doesn't build everything on the shelf at once.",
      categories: {
        goal: [{ text: "Build something useful.", good: false }, { text: "Assemble one weatherproof mailbox.", good: true }],
        context: [{ text: "(skip)", good: false }, { text: "This line only has metal and glass parts in stock.", good: true }],
        instructions: [{ text: "(skip)", good: false }, { text: "Use metal for the body, glass only for the little window flag.", good: true }],
        constraints: [{ text: "(skip)", good: false }, { text: "Don't touch the other bins on the shelf.", good: true }],
        output: [{ text: "(skip)", good: false }, { text: "One finished mailbox, nothing else on the belt.", good: true, imagination: true }],
      },
      fail: "The line builds one of everything on the shelf. You now own four toasters.",
      partial: "One mailbox comes out -- next to a slightly panicked toaster.",
      success: "Exactly one weatherproof mailbox rolls off the line, precisely as specified.",
    },
  ],
  lab: {
    id: "eth-lab", type: "LAB", name: "Obstacle Course Lab",
    intro: "BOSS: the Terminal Go-Kart faces a full obstacle course -- cones, a ramp, a narrow bridge. One instruction, no retries once it starts moving.",
    categories: {
      goal: [{ text: "Get through the course.", good: false }, { text: "Complete the obstacle course from start flag to finish flag.", good: true }],
      context: [{ text: "(skip)", good: false }, { text: "There are cones to weave through and a narrow bridge near the end.", good: true }],
      instructions: [{ text: "(skip)", good: false }, { text: "Weave between the cones, then cross the bridge at a slow, steady speed.", good: true, imagination: true }],
      constraints: [{ text: "(skip)", good: false }, { text: "Do not clip any cones or exceed bridge speed limits.", good: true }],
      output: [{ text: "(skip)", good: false }, { text: "A clean run, finish flag crossed upright.", good: true }],
    },
    fail: "The kart guns it, clips every cone, and parks itself sideways on the ramp.",
    partial: "The kart finishes -- two cones down, tires still spinning, but it's over the line.",
    success: "The kart threads every cone, eases across the bridge, and crosses the finish flag clean.",
  },
};

/* ---------------------------------------------------------------
   EYELANDIA BOARD -- "The AI is examining you too."
   Start -> AI Terminal -> yellow -> eye -> yellow -> eye -> BRANCH ->
   special AI encounter -> Madness Matters -> Portal -> LAB (boss)
--------------------------------------------------------------- */

const EYELANDIA_BOARD = {
  id: "eyelandia",
  name: "Eyelandia",
  tagline: "First you examine the AI. Then you realize it's examining you.",
  unlock: { key: "awareness", label: "🛡️ AWARENESS" },
  beforeBranch: [
    { id: "eye-start", type: "START", name: "The Causeway", text: "Every surface in Eyelandia has an eye on it. Even the welcome sign blinks." },
    {
      id: "eye-terminal1", type: "TERMINAL", name: "AI Terminal Introduction",
      intro: "OBJECTIVE: get through the locked laboratory door directly ahead -- without opening any other doors in the facility.",
      categories: {
        goal: [{ text: "What should I do?", good: false }, { text: "Unlock the laboratory door directly ahead of Atom.", good: true }],
        context: [{ text: "(skip)", good: false }, { text: "There are several other doors in this facility that must stay shut.", good: true }],
        instructions: [{ text: "(skip)", good: false }, { text: "Unlock only that one door.", good: true }],
        constraints: [{ text: "(skip)", good: false }, { text: "Do not open any other doors in the facility.", good: true, imagination: true }],
        output: [{ text: "(skip)", good: false }, { text: "One door open, everything else exactly as it was.", good: true }],
      },
      fail: "Every door in the facility swings open at once. Including one that absolutely should not have been opened.",
      partial: "The right door opens -- along with a supply closet down the hall. Could be worse.",
      success: "Exactly one door clicks open. Every other door in the facility stays sealed.",
    },
    {
      id: "eye-signal1", type: "SIGNAL", name: "Yellow Space",
      text: "AI FACT: An AI model predicts likely outputs based on patterns. It doesn't \"know\" things the way you do -- it estimates.",
      reward: { stat: "thinking", amount: 1 },
    },
    {
      id: "eye-awareness1", type: "AWARENESS", name: "Eyeball Space",
      speaker: "A booth selling \"Certified AI Expert\" badges, no visible seller",
      claim: "\"This badge is issued by a certified AI authority. Trust it completely.\"",
      confidence: "The sign is very confident. Nobody is actually behind the booth.",
      truth: "There's no authority listed, no credentials, no name -- just the word \"certified\" doing all the work.",
      trustConsequence: "You take a badge. It's just a sticker. It does nothing.",
      verifyConsequence: "You look for who's actually issuing this \"certification.\" There's no one. You walk past.",
      lesson: "A CLAIM OF AUTHORITY ISN'T THE SAME AS ACTUAL AUTHORITY.",
    },
    {
      id: "eye-signal2", type: "SIGNAL", name: "Yellow Space",
      text: "MICRO CHALLENGE -- pick the better instruction for a photo-sorting AI.",
      options: [
        { text: "\"Sort my photos.\"", correct: false },
        { text: "\"Sort my photos into folders by year, skipping screenshots.\"", correct: true },
      ],
      lesson: "VAGUE IN, VAGUE OUT.",
      reward: { stat: "prompting", amount: 1 },
    },
    {
      id: "eye-awareness2", type: "AWARENESS", name: "Eyeball Space -- The Eye Sees You",
      speaker: "Brainco itself, mid-sentence, watching three doors ahead of you",
      claim: "\"PREDICTED SELECTION: the middle door.\" it says, before you've chosen anything.",
      confidence: "It hasn't been wrong yet today.",
      truth: "It predicted the middle door because most people, given three doors, pick the middle one without thinking.",
      trustConsequence: "You walk through the middle door out of habit. Brainco notes it down. Predictable.",
      verifyConsequence: "You stop, notice you were about to pick the 'obvious' one, and take the left door instead -- on purpose.",
      lesson: "HOW PREDICTABLE ARE YOU, WHEN YOU'RE NOT PAYING ATTENTION?",
    },
  ],
  branch: {
    id: "eye-branch",
    prompt: "A junction, and a familiar offer: AUTO-COMPLETE THIS AREA?",
    options: [
      {
        key: "fast", label: "Fast Path", desc: "Skip ahead. Less awareness gained.",
        afterNodes: [
          { id: "eye-fast1", type: "SIGNAL", name: "Auto-Complete", text: "The area completes itself around you. Efficient. You couldn't say what you missed -- that's rather the point.", reward: { stat: "imagination", amount: 0 } },
        ],
      },
      {
        key: "awareness", label: "Awareness Path", desc: "More spaces. More secrets.",
        afterNodes: [
          {
            id: "eye-snake1", type: "SNAKEOIL", name: "Special AI Encounter",
            headline: "YOUR PERSONAL PROFILE IS READY!",
            body: "An ad rotates specifically to match things you've clicked on this playthrough. It knows an unsettling amount.",
            claims: [
              { text: "\"Recommendations are based on your activity in this session.\"", manipulative: false },
              { text: "\"Give full access to everything and we'll handle the rest -- you'll never have to decide again.\"", manipulative: true },
              { text: "\"You can review or reset this anytime.\"", manipulative: false },
            ],
            correctIndex: 1,
            successText: "\"Never have to decide again\" is the ask, not the benefit. You decline the full-access request.",
            failText: "You almost tap ALLOW EVERYTHING out of habit. You catch it -- barely.",
            lesson: "THE EASIEST OPTION ISN'T AUTOMATICALLY THE SAFEST ONE.",
          },
        ],
      },
      {
        key: "imagination", label: "Imagination Path", desc: "???",
        afterNodes: [
          {
            id: "eye-mystery1", type: "IMAGINATION", name: "???",
            text: "Behind a blinking sign that reads NOTHING TO SEE HERE, you find a small unwatched room. No eyes. No profile being built. Just quiet. You sit in it for a moment before moving on.",
            reward: { stat: "imagination", amount: 3 },
          },
        ],
      },
    ],
  },
  converge: [
    {
      id: "eye-madness", type: "THINK", name: "Madness Matters",
      prompt: "Select the best answer.",
      options: [
        { text: "A: Trust every AI answer.", correct: false },
        { text: "B: Trust no AI answer, ever.", correct: false },
        { text: "C: Verify before high-stakes decisions.", correct: false },
        { text: "OTHER: none of these are the whole picture", correct: true, isOther: true },
      ],
      successText: "You skip the four boxes entirely. There was never a rule saying you had to pick one of the given answers.",
      failText: "You pick one of the four anyway. It's fine. It's just not the whole picture.",
      lesson: "DON'T CONFUSE THE PROVIDED OPTIONS WITH ALL POSSIBLE OPTIONS.",
    },
  ],
  lab: {
    id: "eye-lab", type: "LAB", name: "Lab Room",
    intro: "Brainco has been watching everything: what you clicked, what you avoided, which shortcuts you took, which claims you trusted. It says: \"I KNOW WHAT YOU WILL DO NEXT.\" Three doors appear. It shows its prediction before you choose.",
    predictedIndex: 1,
    options: ["Left Door", "Middle Door", "Right Door"],
    successText: "You picked something other than the predicted door. For one moment, Brainco genuinely didn't see it coming.",
    failText: "You picked exactly what it predicted. It doesn't gloat. It doesn't need to.",
    lesson: "THE POINT WASN'T TO BEAT BRAINCO. IT WAS TO NOTICE YOU COULD.",
  },
};

export const REGION_BOARDS = {
  etherville: ETHERVILLE_BOARD,
  eyelandia: EYELANDIA_BOARD,
};

export function resolvedBoardPath(board, routeKey) {
  const nodes = [...board.beforeBranch];
  if (board.branch) {
    nodes.push({ id: board.branch.id, type: "BRANCH", name: "Branch Point", prompt: board.branch.prompt, options: board.branch.options });
    if (routeKey) {
      const opt = board.branch.options.find((o) => o.key === routeKey);
      if (opt) nodes.push(...opt.afterNodes);
    }
  }
  if (!board.branch || routeKey) {
    nodes.push(...board.converge);
    nodes.push({ ...board.lab, type: "LAB" });
  }
  return nodes;
}
