// Journal prompts, graded by depth.
//
// depth: "surface" — safe on any day, good for streak-keeping
//        "deep"    — asks something real of you
//        "abyss"   — deeply personal. Flagged `intense`, hidden behind a
//                    confirmation, and switchable off entirely in Settings.
//
// Everything marked `intense` carries a `care` line. The rule this file follows:
// a prompt may take you somewhere difficult, but it must also show you the way
// back out. Nothing here asks you to rehearse harm.

export const PROMPT_CATEGORIES = {
  connection: "The Connection",
  awakening: "Awakening Log",
  shadow: "Shadow",
  identity: "Identity",
  body: "The Body",
  fear: "Fear",
  love: "Love & People",
  power: "Power",
  past: "The Past",
  mortality: "Mortality",
  integration: "Integration",
};

export const PROMPTS = [
  // ---- connection ----------------------------------------------------------
  { id: "p001", cat: "connection", depth: "surface", text: "When did you feel closest to your higher self today, even for a second?" },
  { id: "p002", cat: "connection", depth: "surface", text: "What did the signal feel like today — words, images, body sensation, knowing, or nothing at all?" },
  { id: "p003", cat: "connection", depth: "deep", text: "Write a letter from your higher self to you, dated today. Don't plan it. Let the first sentence choose the rest." },
  { id: "p004", cat: "connection", depth: "deep", text: "What have you asked for guidance about that you already know the answer to?" },
  { id: "p005", cat: "connection", depth: "deep", text: "If your higher self could only send you one word for the next month, what do you suspect it would be?" },
  { id: "p006", cat: "connection", depth: "surface", text: "Describe the moment the gate first opened for you. Details, not conclusions." },
  { id: "p007", cat: "connection", depth: "deep", text: "What are you afraid your higher self will ask you to give up?", intense: true, care: "You can name it without agreeing to do it. Naming is the whole task today." },
  { id: "p008", cat: "connection", depth: "deep", text: "Where in your life are you taking guidance from someone who is not your higher self and calling it intuition?" },

  // ---- awakening log -------------------------------------------------------
  { id: "p010", cat: "awakening", depth: "surface", text: "Log today's practice: what you did, how long, what happened, and what you'd change." },
  { id: "p011", cat: "awakening", depth: "surface", text: "Anything strange today? Synchronicity, timing, a repeated number, a stranger's sentence. Record it without interpreting it yet." },
  { id: "p012", cat: "awakening", depth: "deep", text: "What has changed in you over the last thirty days that a person who knew you well would notice?" },
  { id: "p013", cat: "awakening", depth: "deep", text: "What have you started to see about reality that you can't unsee? Is that a gift, a burden, or both today?" },
  { id: "p014", cat: "awakening", depth: "surface", text: "What did you dream? Write it before you decide it means anything." },
  { id: "p015", cat: "awakening", depth: "deep", text: "What proof would convince you this is all projection? What proof would convince you it isn't? Sit in the space between the two answers." },
  { id: "p016", cat: "awakening", depth: "deep", text: "Where are you using spiritual language to avoid a practical responsibility?" },

  // ---- shadow --------------------------------------------------------------
  { id: "p020", cat: "shadow", depth: "deep", text: "Who did you judge today, and what does that judgment reveal about a part of yourself you exiled?" },
  { id: "p021", cat: "shadow", depth: "deep", text: "What version of you shows up when you're exhausted and no one is watching? Describe that person honestly." },
  { id: "p022", cat: "shadow", depth: "abyss", text: "What is the thing you'd least want read aloud about you — and is it actually true?", intense: true, care: "Write it, look at it, and then write one sentence you'd say to a friend who confessed the same thing." },
  { id: "p023", cat: "shadow", depth: "deep", text: "Where are you playing the victim in a story where you had a choice?" },
  { id: "p024", cat: "shadow", depth: "abyss", text: "Who have you hurt, and have you ever let yourself feel the full shape of it?", intense: true, care: "Feeling it is not the same as drowning in it. Set a timer for ten minutes, then close the notebook and go outside." },
  { id: "p025", cat: "shadow", depth: "deep", text: "What do you get out of the problem you say you want solved?" },
  { id: "p026", cat: "shadow", depth: "abyss", text: "What part of you have you been trying to kill off instead of integrate?", intense: true, care: "Nothing in you needs to be destroyed. Ask that part what job it thought it was doing." },

  // ---- identity ------------------------------------------------------------
  { id: "p030", cat: "identity", depth: "surface", text: "Finish twenty times: 'I am the kind of person who…' Don't edit, don't stop, don't be modest." },
  { id: "p031", cat: "identity", depth: "deep", text: "What identity are you still wearing that expired years ago?" },
  { id: "p032", cat: "identity", depth: "deep", text: "If nobody would ever know what you chose, what would you choose?" },
  { id: "p033", cat: "identity", depth: "deep", text: "Whose approval are you still organizing your life around? Are they even watching?" },
  { id: "p034", cat: "identity", depth: "abyss", text: "Who were you before you learned what you had to do to be loved?", intense: true, care: "This one tends to arrive as a specific memory. Let it come, then get warm — a blanket, food, someone's voice." },
  { id: "p035", cat: "identity", depth: "deep", text: "Write your own name at the top and describe yourself as your higher self would describe you to a stranger." },
  { id: "p036", cat: "identity", depth: "surface", text: "What are three things you're good at that you consistently refuse to take credit for?" },

  // ---- body ----------------------------------------------------------------
  { id: "p040", cat: "body", depth: "surface", text: "Scan head to feet. Where is the tension living today? Give it a shape and a color." },
  { id: "p041", cat: "body", depth: "deep", text: "What has your body been telling you that you've been overruling?" },
  { id: "p042", cat: "body", depth: "deep", text: "Where do you feel your higher self in your body? Chest, spine, crown, gut, hands, nowhere?" },
  { id: "p043", cat: "body", depth: "abyss", text: "What is your relationship with your own body, said plainly, with no spiritual varnish on it?", intense: true, care: "Plain honesty here can sting. End by naming one thing your body has carried you through." },
  { id: "p044", cat: "body", depth: "surface", text: "How did you sleep, eat, move, and breathe today, and how did each one change your access to the signal?" },

  // ---- fear ----------------------------------------------------------------
  { id: "p050", cat: "fear", depth: "surface", text: "What are you afraid of this week? List it all. No ranking, no solving." },
  { id: "p051", cat: "fear", depth: "deep", text: "What would you attempt this year if the failure would be private?" },
  { id: "p052", cat: "fear", depth: "deep", text: "Which of your fears is actually protecting something valuable, and which is just an old habit of the nervous system?" },
  { id: "p053", cat: "fear", depth: "abyss", text: "What is the fear underneath the fear? Keep asking 'and if that happened?' until you hit bedrock.", intense: true, care: "The bedrock is usually abandonment, worthlessness, or annihilation. When you reach it, stop digging and put your hand on your own chest." },
  { id: "p054", cat: "fear", depth: "deep", text: "Where has fear been wearing the mask of practicality in your decisions?" },

  // ---- love & people -------------------------------------------------------
  { id: "p060", cat: "love", depth: "surface", text: "Who made you feel more like yourself this week? Have you told them?" },
  { id: "p061", cat: "love", depth: "deep", text: "What are you tolerating in a relationship that your higher self would not tolerate for you?" },
  { id: "p062", cat: "love", depth: "deep", text: "Where are you loving someone in a way that costs you your own center?" },
  { id: "p063", cat: "love", depth: "abyss", text: "Who do you need to forgive — including, possibly, yourself — and what has holding it given you?", intense: true, care: "Forgiveness is not required today. Understanding what the grudge is doing for you is enough." },
  { id: "p064", cat: "love", depth: "deep", text: "What do you want from people that you have never once directly asked for?" },
  { id: "p065", cat: "love", depth: "surface", text: "Describe the relationship you want in three years, in present tense, as if it's a Tuesday inside it." },

  // ---- power ---------------------------------------------------------------
  { id: "p070", cat: "power", depth: "surface", text: "When did you feel most capable today? Reconstruct the conditions that produced it." },
  { id: "p071", cat: "power", depth: "deep", text: "Where are you giving away authority over your own life, and to whom?" },
  { id: "p072", cat: "power", depth: "deep", text: "What would change if you assumed you were allowed?" },
  { id: "p073", cat: "power", depth: "deep", text: "What are you pretending not to know?" },
  { id: "p074", cat: "power", depth: "abyss", text: "What have you settled for, and what did you tell yourself to make it bearable?", intense: true, care: "Seeing it clearly is the point. You do not have to blow up your life by Friday." },

  // ---- the past ------------------------------------------------------------
  { id: "p080", cat: "past", depth: "deep", text: "Which chapter of your life are you still living in even though it ended?" },
  { id: "p081", cat: "past", depth: "abyss", text: "What happened to you that you have never really told anyone the true version of?", intense: true, care: "You are only writing it here, for you. Stop the moment it stops feeling like release and starts feeling like reliving." },
  { id: "p082", cat: "past", depth: "deep", text: "What would the you of five years ago be relieved to know about today?" },
  { id: "p083", cat: "past", depth: "deep", text: "Write to a younger version of you at a specific age. Tell them what you now know." },
  { id: "p084", cat: "past", depth: "abyss", text: "What did you decide about yourself as a child that you are still obeying?", intense: true, care: "Whatever it is — you were small, and you were doing your best with the information you had." },

  // ---- mortality -----------------------------------------------------------
  { id: "p090", cat: "mortality", depth: "deep", text: "If you had one year, what would you stop doing tomorrow morning?" },
  { id: "p091", cat: "mortality", depth: "abyss", text: "Write the paragraph you'd want said about you. Then say honestly how far the current draft of your life is from it.", intense: true, care: "The gap is information, not a verdict. Pick one thing that closes it slightly." },
  { id: "p092", cat: "mortality", depth: "deep", text: "What will you regret not saying?" },
  { id: "p093", cat: "mortality", depth: "deep", text: "What are you saving for a version of your life that may not arrive?" },

  // ---- integration ---------------------------------------------------------
  { id: "p100", cat: "integration", depth: "surface", text: "What's one insight from this week you haven't turned into a behavior yet?" },
  { id: "p101", cat: "integration", depth: "deep", text: "Where did you go up the mountain this month, and where did the descent get sloppy?" },
  { id: "p102", cat: "integration", depth: "surface", text: "What is working right now? Be specific enough that you could repeat it deliberately." },
  { id: "p103", cat: "integration", depth: "deep", text: "What did you learn about your own connection this week that you'd tell someone starting out?" },
  { id: "p104", cat: "integration", depth: "surface", text: "Ordinary log: what happened today, plainly told. Not everything has to be profound." },
];

export const promptById = Object.fromEntries(PROMPTS.map((p) => [p.id, p]));

export function availablePrompts({ showDeep = true } = {}) {
  return showDeep ? PROMPTS : PROMPTS.filter((p) => !p.intense);
}
