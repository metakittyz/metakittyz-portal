// The Codex — the standing knowledge library.
//
// Three pillars: Mind (neuroscience), Body (health & fitness), Spirit
// (practice & awakening). Every entry declares its evidence class so you always
// know whether you're reading a replicated finding, a plausible-but-oversold
// popular idea, or a contemplative practice that was never a lab result and
// doesn't pretend to be.

export const CODEX = [
  // =========================================================================
  // MIND
  // =========================================================================
  {
    id: "c-mind-01",
    pillar: "mind",
    title: "Two States and the Switch Between Them",
    subtitle: "Everything downstream depends on which mode your body thinks it's in.",
    evidence: "researched",
    read: 3,
    body: [
      "Your autonomic nervous system runs a continuous background decision: mobilize, or restore. Sympathetic activation raises heart rate, narrows attention, and prepares for effort. Parasympathetic activity does the opposite — slows the heart, widens attention, and permits digestion, repair, and reflection. Neither is good or bad. Problems come from being stuck in one.",
      "Two practical facts follow. First, most of what you call a mood is a state your body picked before your mind supplied a reason. You will spend an enormous amount of energy arguing with reasons that were generated after the fact. Second, the switch is partly under voluntary control — through breath, temperature, movement, posture, and where you point your eyes. That's the entire mechanical basis of every State Stack in this app.",
      "Performance follows an inverted U: too little arousal and nothing happens, too much and you fragment. Your maximum working state is not maximum activation. It is precisely enough charge to be sharp, plus enough safety in the body that the charge doesn't spill into anxiety. Learning to find that band deliberately, rather than waiting for it to arrive, is most of what people mean by 'getting your mind right'.",
    ],
    practice: "For three days, log your state four times a day on a scale of 1-10 for activation and 1-10 for ease. You're looking for the coordinates of your own best hour.",
  },
  {
    id: "c-mind-02",
    pillar: "mind",
    title: "How Change Actually Gets Installed",
    subtitle: "Neuroplasticity has requirements, and 'trying harder' isn't one of them.",
    evidence: "researched",
    read: 3,
    body: [
      "Adult brains change, but not on demand and not from intention. The reliable ingredients are focused attention, repetition, something that marks the experience as important — surprise, emotional weight, real consequence — and then rest, especially sleep, during which the change is actually consolidated.",
      "This reframes several things. Practice sessions that are short and highly attentive beat long distracted ones. Repetition without attention builds almost nothing, which is why you can do a thing for years and never get better at it. And sleep is not the gap between training days; it is a phase of training. Skipping it doesn't cost you rest, it costs you the learning.",
      "It also explains why so much spiritual and psychological insight fails to stick. A profound realization is a single high-salience event. Without repetition and consolidation it stays a memory of having understood something, rather than a change in how you actually operate. This is precisely why this app makes you log daily instead of trusting you to remember the mountaintop.",
    ],
    practice: "Pick one change. Give it fifteen genuinely attentive minutes a day, every day, and protect your sleep. Judge it at six weeks, not six days.",
  },
  {
    id: "c-mind-03",
    pillar: "mind",
    title: "The Voice That Runs When Nothing Else Is Running",
    subtitle: "Default mode, self-narration, and what silence actually does.",
    evidence: "researched",
    read: 3,
    body: [
      "When you're not focused on a task, a particular network of brain regions becomes more active. It's associated with mind-wandering, autobiographical memory, imagining the future, and thinking about yourself and other people. It is, roughly, the machinery of the ongoing story of you.",
      "Two findings matter here. Mind-wandering correlates with lower reported happiness in the moment, even when the content of the wandering is pleasant. And experienced meditators show reduced activity and altered connectivity in this network — which lines up neatly with what contemplatives have described for millennia as the quieting of the self-referential chatter.",
      "Be careful with the pop version of this. 'Turning off the default mode network' is not the goal and isn't how it works; the network does necessary jobs, including much of your capacity for empathy and planning. The realistic aim is a different relationship with the narration: hearing it as one voice in the room rather than as the room itself. That shift — from being the commentary to listening to it — is the doorway most traditions are pointing at, whatever vocabulary they use.",
    ],
    practice: "Sit for ten minutes. Don't stop the thoughts. Just label each one 'thinking' and let it pass. You're practicing the shift from inside the voice to beside it.",
  },
  {
    id: "c-mind-04",
    pillar: "mind",
    title: "Why Everything Feels Flat",
    subtitle: "Dopamine baselines, stacked stimulation, and the cost of easy peaks.",
    evidence: "mixed",
    read: 3,
    body: [
      "Dopamine isn't the pleasure chemical — it's more accurately about motivation, wanting, and the prediction of reward. What matters practically is that it operates around a baseline, and big or frequent peaks tend to be followed by a dip below that baseline. Chase enough peaks and the floor itself moves.",
      "The applied version, popular in the online health world, is that stacking stimulation — phone plus music plus caffeine plus sugar plus novelty, all at once, all day — makes ordinary effort feel unbearable by comparison. The precise mechanism is more contested than the confident YouTube version suggests, and the term 'dopamine detox' is not a real neuroscience concept. But the behavioral observation holds up in most people's own experience: reduce the stacking and difficult things get noticeably less difficult.",
      "The lever that seems most robust is not deprivation but decoupling: don't layer stimulation onto the thing that's supposed to be intrinsically rewarding. No podcast during the workout you want to love. No phone during the meal. Let the thing be as interesting as it actually is, and let your baseline recalibrate to it.",
    ],
    practice: "Choose one activity you want to genuinely enjoy again. Strip every add-on from it for two weeks. Notice week one is worse and week two is better.",
  },
  {
    id: "c-mind-05",
    pillar: "mind",
    title: "Naming It Changes It",
    subtitle: "Affect labeling is the cheapest emotional regulation you own.",
    evidence: "researched",
    read: 2,
    body: [
      "Putting a feeling into words reliably reduces its intensity. In imaging studies, labeling an emotion is associated with reduced amygdala response and increased activity in prefrontal regions. In plain terms: describing it moves it out of pure reactivity and into a system that can work with it.",
      "Specificity does the heavy lifting. 'I feel bad' does very little. 'I feel humiliated, specifically about what I said in that meeting, specifically because I sounded like I was pleading' does a great deal. The gain comes from the precision of the noun, not the act of venting — and venting without labeling can actually amplify things.",
      "This is why almost every journal prompt in this app asks you to name something exactly. It isn't literary preference. It's the mechanism.",
    ],
    practice: "Next time you're hit, write the sentence: 'I feel ____ about ____ because it touches ____.' Fill all three blanks before you do anything else.",
  },
  {
    id: "c-mind-06",
    pillar: "mind",
    title: "Talk to Yourself in the Second Person",
    subtitle: "Why 'you can do this' outperforms 'I can do this'.",
    evidence: "researched",
    read: 2,
    body: [
      "There's a consistent finding in the self-talk literature: addressing yourself by name or as 'you' — rather than 'I' — improves emotion regulation and performance under stress. The working explanation is psychological distancing. Second person puts a small gap between the observer and the storm, and that gap is where perspective lives.",
      "It also happens to be exactly how you'd speak to someone you love who was struggling. Most people can produce warm, clear, useful counsel for a friend and nothing but contempt for themselves. Switching pronouns borrows the friend's voice.",
      "This is the direct rationale for the Voice Room. Recording reassurance in your own voice, addressed to yourself as 'you', hits both mechanisms at once — the distancing of second person, and the strange authority of hearing your own voice on your own side.",
    ],
    practice: "Write today's hardest moment as advice to someone with your name. Read it out loud. Notice how different it is from what you were telling yourself.",
  },
  {
    id: "c-mind-07",
    pillar: "mind",
    title: "Memory Is Not a Recording",
    subtitle: "Every time you recall something, you rewrite it.",
    evidence: "researched",
    read: 3,
    body: [
      "Recalling a memory appears to make it temporarily labile — open to modification — before it's stored again. That's reconsolidation. The upshot is that memory is reconstructive rather than archival, and each retrieval is also a small act of authorship.",
      "This has a hopeful implication and a cautionary one. Hopeful: revisiting a painful memory in a genuinely safe state, with new information or a new emotional context, may change how it's re-stored. This is one of the mechanisms several trauma therapies are thought to work through. Cautionary: revisiting it in a distressed, unsupported state can deepen the groove instead. Rumination is not processing.",
      "Practically, this means the state you're in when you open old material matters more than the fact that you opened it. Journaling into the past while dysregulated is not therapy — it's rehearsal. Settle the body first, set a time limit, and end by returning to the present. This is why every intense prompt in this app comes with a way back out.",
    ],
    caution:
      "For significant trauma, this is work to do with a trained professional, not a solo experiment with an app. There is no prize for doing it alone.",
    practice: "Before opening anything heavy: five slow exhales, a timer set for fifteen minutes, and a plan for what you'll do afterward — walk, eat, call someone.",
  },
  {
    id: "c-mind-08",
    pillar: "mind",
    title: "Fear Isn't Deleted, It's Overwritten",
    subtitle: "Extinction learning, avoidance, and why exposure has to be real.",
    evidence: "researched",
    read: 2,
    body: [
      "When a learned fear fades, the original association isn't erased. A new, competing 'this is safe now' learning is laid down on top of it, and which one wins depends on context, stress, and time. That's why fears return under pressure, in new settings, or after a long gap.",
      "Two consequences. Avoidance is the single most effective way to preserve a fear indefinitely — every avoided encounter is a lost opportunity to write the competing learning. And the safe experience has to actually be experienced. Reasoning about it, visualizing it, or reading about it doesn't lay down the same track.",
      "This is the honest, unglamorous mechanics under 'do the thing you're afraid of'. Not because courage is a virtue, but because your nervous system only updates on evidence, and only you can generate the evidence.",
    ],
    practice: "Name one thing you've been avoiding. Find the smallest real version of it you could do this week. Do that one. Repetition beats intensity here.",
  },
  {
    id: "c-mind-09",
    pillar: "mind",
    title: "Interoception",
    subtitle: "The sense you were never taught, and the one this whole practice runs on.",
    evidence: "researched",
    read: 3,
    body: [
      "Interoception is your perception of your own internal state — heartbeat, breath, gut, temperature, tension. It's processed heavily through the insula, and it's the substrate of what you experience as emotion. Feelings are, in large part, interpretations of body signals.",
      "Interoceptive accuracy varies enormously between people and appears trainable. It correlates with emotion regulation and with the ability to make good intuitive decisions. And it degrades under chronic stress and dissociation — precisely when you need it most.",
      "This matters for spiritual practice more than almost anything else on this page. Nearly every technique for perceiving 'guidance' — the drop in the chest, the settling, the tightening, the yes and the no — is interoceptive. Whatever you believe the source is, the receiver is your body. Training the receiver is not a metaphysical claim. It's basic instrument maintenance.",
    ],
    practice: "Twice a day, close your eyes and try to feel your own heartbeat without touching your pulse. Whether or not you succeed, you're training the channel.",
  },

  // =========================================================================
  // BODY
  // =========================================================================
  {
    id: "c-body-01",
    pillar: "body",
    title: "The Aerobic Base",
    subtitle: "The least glamorous training, and the one that changes your baseline the most.",
    evidence: "researched",
    read: 3,
    body: [
      "Low-intensity aerobic work — the conversational pace often labelled Zone 2 — improves mitochondrial density and function, fat oxidation, and the general resilience of your cardiovascular system. Cardiorespiratory fitness is among the strongest known predictors of long-term health outcomes, comparable to or exceeding conventional risk factors.",
      "The dose most commonly cited is around 150-180 minutes a week of easy work, in chunks of at least 30-45 minutes, plus a small amount of genuinely hard interval work — something like four rounds of four minutes near maximum with equal rest, once a week — to develop peak capacity. The precise zone boundaries are less important than the honest test: easy work means you can hold a conversation, and most people ride far too hard on their easy days.",
      "For the purposes of this app, the relevant effect is downstream. Aerobic capacity is what makes you unflappable on a hard day. It raises the ceiling on how much life you can absorb before your state degrades, which means it is a spiritual practice in the same way sleep is: not because it's mystical, but because everything else runs on it.",
    ],
    practice: "Three easy 45-minute sessions a week where you could hold a conversation the whole time. Add one hard interval session. Nothing else changes.",
  },
  {
    id: "c-body-02",
    pillar: "body",
    title: "Strength Is a Baseline Capacity",
    subtitle: "Not vanity. Structural insurance and a state-change tool.",
    evidence: "researched",
    read: 3,
    body: [
      "Resistance training preserves muscle mass and bone density, improves insulin sensitivity, and independently predicts better outcomes with age. Grip strength alone is a startlingly good general health marker. Muscle you build in your thirties is capacity you still have in your seventies.",
      "The evidence-based minimum is more forgiving than gym culture implies: roughly 10-20 hard sets per muscle group per week, taken near failure, across two or more sessions. Progressive overload — gradually more weight, reps, or quality — is the actual driver. Programme details matter far less than showing up consistently for years.",
      "There's a psychological dividend that's harder to measure and hard to miss. Lifting something today you couldn't lift last month is unusually direct evidence that you are capable of change. On days your mind won't believe anything you tell it, the bar is unarguable.",
    ],
    caution: "New to loaded training, or returning after injury? Get form coached by a human. Cheap now, very expensive later.",
    practice: "Two sessions a week. Push, pull, hinge, squat, carry. Log the numbers — the log is where the proof lives.",
  },
  {
    id: "c-body-03",
    pillar: "body",
    title: "Sleep Is Not Negotiable",
    subtitle: "The foundation everything else in this app sits on.",
    evidence: "researched",
    read: 3,
    body: [
      "Sleep loss degrades attention, emotional regulation, glucose handling, immune function, and memory consolidation. Emotional reactivity in particular goes up sharply — amygdala responses to negative stimuli increase with sleep deprivation while top-down regulation weakens. Which is to say: a sleep-deprived person is not a well-regulated person having a bad day. They're a differently-wired person.",
      "The reliable levers are boring. A consistent wake time, seven days a week, matters more than bedtime. Bright light early and dim light late. A cool room — core temperature has to drop for sleep to initiate. Caffeine has a half-life of roughly five to six hours, so an afternoon coffee is still meaningfully present at midnight. Alcohol sedates but fragments sleep architecture, particularly REM.",
      "For anyone doing intensive contemplative practice, add this: sleep is where the day's emotional material gets metabolized. Practices that open a lot of material while you're also sleeping badly is the most common recipe for the destabilization this app warns you about. If your sleep goes, reduce the practice. Not the other way around.",
    ],
    practice: "Fix your wake time for two weeks. Same time daily, including weekends. Change nothing else and measure how you feel on day fourteen.",
  },
  {
    id: "c-body-04",
    pillar: "body",
    title: "Light Is a Drug You Take Through Your Eyes",
    subtitle: "The strongest lever on your body clock, and it's free.",
    evidence: "researched",
    read: 2,
    body: [
      "Specialized cells in your retina detect ambient light and signal directly to the brain's master clock. That signal sets circadian timing, which in turn governs alertness, hormone rhythms, body temperature, and when you'll be able to fall asleep tonight.",
      "The intensity gap is the part most people underestimate. A bright indoor room is a few hundred lux. An overcast morning outside is thousands. Direct sun is tens of thousands. Through a window, you lose most of it. This is why 'get outside in the morning' beats 'sit near a window' by a wide margin, and why ten minutes outdoors early does more than an hour of indoor light.",
      "The evening is the same lever pointed backwards. Bright light at night delays your clock and suppresses melatonin. You don't need special glasses or elaborate systems — you need to turn the overheads off and stop staring at a bright rectangle an arm's length from your face at 11pm.",
    ],
    practice: "Ten minutes outside within an hour of waking, every day, no sunglasses, no phone. It's the cheapest intervention in this entire library.",
  },
  {
    id: "c-body-05",
    pillar: "body",
    title: "Breath Is the Manual Override",
    subtitle: "The only autonomic function you can consciously drive.",
    evidence: "researched",
    read: 3,
    body: [
      "Heart rate rises slightly on inhale and falls on exhale. That coupling means breathing pattern is a direct, voluntary input into autonomic state. Extending the exhale relative to the inhale biases toward parasympathetic activity. It is the one place where conscious control reaches the involuntary system.",
      "A few patterns worth knowing. The double-inhale-long-exhale 'physiological sigh' is among the fastest voluntary ways to reduce acute arousal, and a controlled trial found brief daily cyclic sighing improved mood and lowered respiratory rate more than an equivalent dose of mindfulness meditation. Box breathing — four in, four hold, four out, four hold — is a good general regulator. Slow breathing around six breaths per minute maximizes heart rate variability and is the basis of most resonance-frequency work.",
      "Hyperventilation-based methods — rapid deep breathing followed by breath holds — do produce dramatic subjective effects, but the physiology is different: they drive down CO2, which can cause dizziness, tetany, and fainting. Whatever you think of them, the safety rule is absolute and non-negotiable.",
    ],
    caution:
      "Never do breath-holding or hyperventilation practices in or near water, while driving, or standing. People have drowned doing this. Avoid them entirely if you're pregnant, have epilepsy, cardiovascular conditions, or a history of fainting.",
    practice: "Learn one pattern properly rather than five badly. Start with the double inhale and long exhale, five rounds, three times a day.",
  },
  {
    id: "c-body-06",
    pillar: "body",
    title: "Protein, Plainly",
    subtitle: "The one nutrition variable most worth getting right.",
    evidence: "researched",
    read: 2,
    body: [
      "For people training regularly, protein intake in the range of roughly 1.6-2.2 grams per kilogram of bodyweight per day supports muscle retention and growth; beyond that the returns flatten. Higher-protein diets also tend to improve satiety, which makes everything else about eating easier.",
      "Distribution matters somewhat — spreading intake across three or four meals appears modestly better than one large hit — but total daily intake dominates. Sources are flexible; plant-based eaters generally need a bit more total protein and more variety to cover the amino acid profile.",
      "Everything else in nutrition is downstream noise by comparison, for most people, most of the time: eat enough plants, enough fibre, and enough calories to support what you're asking your body to do. Elaborate protocols are usually a way of avoiding the boring answer.",
    ],
    caution: "Existing kidney disease changes this advice. Talk to your doctor rather than an app.",
    practice: "For one week, actually count it. Most people discover they're eating around half of what they assumed.",
  },
  {
    id: "c-body-07",
    pillar: "body",
    title: "Cold, Heat, and What They Actually Do",
    subtitle: "Real effects, widely oversold.",
    evidence: "mixed",
    read: 3,
    body: [
      "Cold exposure produces a large, reliable rise in noradrenaline and a subjective jolt of alertness that can persist for hours. That effect is real and it's the honest reason to do it. The mood and resilience benefits people report are plausible and partially supported, though studies are often small and hard to blind — you can't give someone a placebo ice bath.",
      "Two caveats worth knowing. Cold immersion immediately after resistance training appears to blunt some of the muscle adaptation you just trained for, so separate them by several hours if you're chasing strength. And the fat-loss-through-brown-fat claims are, in humans, very small at realistic exposures.",
      "Sauna has a somewhat stronger observational evidence base — large Finnish cohort studies associate frequent sauna use with lower cardiovascular mortality — though observational data can't fully rule out that the kind of person who saunas four times a week differs in other ways.",
    ],
    caution:
      "Cold immersion can cause cold shock and arrhythmia. Never alone, never after alcohol, and not at all with cardiac conditions or during pregnancy without medical clearance. Face-splashing is a much safer way to get most of the alertness effect.",
    practice: "Start with the last 30-60 seconds of your shower. That's enough for the alertness effect. Escalate only if you actually want to.",
  },
  {
    id: "c-body-08",
    pillar: "body",
    title: "Knowing When to Back Off",
    subtitle: "Recovery, HRV, and the difference between discipline and self-harm.",
    evidence: "mixed",
    read: 2,
    body: [
      "Heart rate variability — the variation in time between heartbeats — broadly reflects autonomic balance, with higher values generally indicating a more recovered, parasympathetically-available state. It's genuinely useful, but only against your own baseline over weeks. Comparing your number to someone else's is meaningless, and single-day readings are noisy enough to be misleading.",
      "The more reliable indicators are unglamorous and free: resting heart rate trending up, sleep getting worse, motivation gone, small illnesses recurring, mood flattening, performance falling in a straight line. When three of those show up at once, the answer is less, not more.",
      "This matters especially for the kind of person drawn to an app like this. Intensity is the easy part for you. Backing off is the discipline you haven't trained. A deload week — half the volume, same movement — is not a failure of will. It's the part of the cycle where the adaptation actually happens.",
    ],
    practice: "Every fourth week, halve your training volume on purpose. Notice how much stronger you feel in week five.",
  },

  // =========================================================================
  // SPIRIT
  // =========================================================================
  {
    id: "c-spirit-01",
    pillar: "spirit",
    title: "What People Mean by 'Higher Self'",
    subtitle: "Five maps of the same territory. None of them is the territory.",
    evidence: "traditional",
    read: 4,
    body: [
      "The phrase gets used for several genuinely different ideas, and conflating them causes a lot of confusion. In Jungian psychology, the Self is the organizing totality of the psyche, conscious and unconscious — something you move toward through individuation rather than something that instructs you. In Vedanta, atman is the innermost reality, ultimately not separate from Brahman; the practice is recognition, not communication. In the Western esoteric tradition, the Holy Guardian Angel is described as a distinct intelligence with which one achieves 'knowledge and conversation' — explicitly a relationship with an other.",
      "Modern therapeutic frames add more. Internal Family Systems describes a core 'Self' with qualities like calm, curiosity, compassion, and courage, which emerges when protective parts relax — a model that produces remarkably similar phenomenology without any metaphysical claim at all. And plain psychology offers the 'future self': the person you'll be in ten years, whose interests you routinely neglect and whose counsel is often obvious.",
      "These maps disagree fundamentally about what the thing is. One says it's you, one says it's not, one says the question is malformed. What's striking is how much they converge on practice — silence, honesty, address, patience, and testing what comes by its fruit — and on the warning signs of going wrong.",
      "The stance this app takes: hold the map loosely and take the practice seriously. You do not need to settle the metaphysics to run the experiment. What you need is to notice, honestly and in writing, whether relating to this — whatever it is — makes you more honest, kinder, clearer, and more capable. That's a question you can actually answer.",
    ],
    practice: "Write which of these maps you're actually using, and where you got it. Then ask whether it's serving you or just familiar.",
  },
  {
    id: "c-spirit-02",
    pillar: "spirit",
    title: "The Three Families of Meditation",
    subtitle: "They are not interchangeable, and they don't do the same thing.",
    evidence: "mixed",
    read: 4,
    body: [
      "Concentration practices (shamatha, mantra, breath-focus) train stability by returning attention to one object again and again. They tend to produce calm, sharpened focus, and eventually states of considerable absorption. They are the foundation most traditions build on, and they are the least likely to destabilize you.",
      "Open-monitoring practices (vipassana, choiceless awareness, noting) train you to observe whatever arises without grabbing or pushing away. These produce insight into the constructed, impermanent nature of experience — and they are also the ones most associated with difficult territory, because what arises includes everything you've been not-looking-at.",
      "Self-inquiry and non-dual practices (Ramana Maharshi's 'Who am I?', Dzogchen and Mahamudra pointing-out instructions) don't train attention so much as investigate the one who's attending. Turn attention back on itself and look for the looker. What's found, or not found, is the point.",
      "Meditation research is real but frequently overstated in popular coverage — effect sizes for wellbeing outcomes are typically modest, and study quality varies widely. Meanwhile, adverse effects are under-discussed: survey work suggests a non-trivial minority of practitioners experience unpleasant or distressing episodes, more often with intensive practice and open-monitoring styles. This is not a reason to avoid practice. It's a reason to have a teacher, a ceiling on intensity, and someone who'd notice if you got strange.",
    ],
    caution:
      "If practice is producing persistent fear, unreality, insomnia, or dissociation, stop the intensive form, return to grounded concentration practice, and get support from someone experienced. Pushing through is the wrong instinct here.",
    practice: "Pick one family and stay with it for eight weeks. Sampling all three weekly is how people practice for years without getting anywhere.",
  },
  {
    id: "c-spirit-03",
    pillar: "spirit",
    title: "Dialogue on the Page",
    subtitle: "Automatic writing, active imagination, and the honest version of the question.",
    evidence: "traditional",
    read: 3,
    body: [
      "Written dialogue with an inner figure is an old technique with several lineages. Jung called his version active imagination and considered it central — you address a figure from the unconscious and then, crucially, allow it to respond in its own voice rather than scripting it. Spiritualist automatic writing frames the same activity as reception from an external source. Contemporary parts-work therapies do it with no metaphysical claim at all.",
      "The technique is simple. Write your question. Then write the answer without pausing, without editing, and without deciding in advance what it will say. Speed helps — it outruns the editor. Handwriting often works better than typing. The answers frequently have a different tone, vocabulary, and even handwriting than your own, which is precisely why people across three very different worldviews all found it worth doing.",
      "What is actually happening is unsettled, and you don't have to settle it. What matters is that the material is real material — it comes from somewhere in you or through you, and it's usually saying something you'd been declining to hear. Treat it the way you'd treat a letter from a wise, occasionally wrong friend: read it seriously, act on it selectively, and run anything major through the Discernment Test before you rearrange your life around it.",
    ],
    practice: "Ten minutes, pen on paper, one question at the top. Don't stop moving the pen even to think. Read it only after the timer ends.",
  },
  {
    id: "c-spirit-04",
    pillar: "spirit",
    title: "Synchronicity and the Discernment Problem",
    subtitle: "How to take signs seriously without losing your judgment.",
    evidence: "mixed",
    read: 4,
    body: [
      "Jung coined synchronicity for meaningful coincidences that don't have a causal link. The experience is genuine and frequently powerful. The interpretive question is where things get dangerous, because two things are simultaneously true: your pattern-detection is extraordinarily good, and it also fires constantly on noise.",
      "Known cognitive machinery accounts for a lot of it. Once something is salient you start noticing it everywhere. Ambiguous statements feel personally precise. You remember the hits and forget the misses. None of this proves that no synchronicity is meaningful — it does mean that the raw feeling of significance is not evidence of significance, and that the feeling gets stronger exactly when you're most emotionally invested.",
      "The practical discipline is to separate noticing from interpreting, and to separate interpreting from acting. Record what happened, plainly, without meaning attached. Let it sit. If a pattern is real it will repeat and survive a night's sleep. And never let a sign make a decision you wouldn't otherwise be able to justify — a genuine one will still look right when examined with ordinary judgment.",
      "The reliable failure mode looks like this: significance escalates, coincidences seem to be about you specifically, urgency rises, and the guidance conveniently confirms what you already wanted. That combination is the clearest warning sign in this entire library. If you notice it, ground, sleep, and tell someone who'll be honest with you.",
    ],
    caution:
      "Escalating personal significance, a sense of special mission, and urgency are also early features of mania and psychosis. If someone who loves you says you seem different, take that more seriously than the signs.",
    practice: "Keep a plain log with two columns: what happened, and — days later, in different ink — what you think it meant. The gap between columns teaches you your own patterns.",
  },
  {
    id: "c-spirit-05",
    pillar: "spirit",
    title: "The Energy Body as a Map",
    subtitle: "Chakras, dantian, and reading a map for what it's good for.",
    evidence: "traditional",
    read: 3,
    body: [
      "The subtle-body systems — the chakras of tantric traditions, the dantian of Daoist practice, the meridians of Chinese medicine — are elaborate, internally consistent, and mutually contradictory in their details. They do not correspond to anatomical structures, and attempts to map them onto endocrine glands are retrofits from the last century or so, not part of the original systems.",
      "That doesn't make them useless. They are exceptionally good phenomenological maps — descriptions of where humans reliably feel things and how attention placed in those regions behaves. Grief does sit in the chest. Fear does sit in the gut. Attention held at the lower belly does settle the system in a way attention held at the forehead does not. The map earns its keep by directing your attention usefully, which is a real function.",
      "So use them the way you'd use any good instrument: as a way of locating and working with experience, not as claims about tissue. Someone who tells you a chakra is 'blocked' and requires payment to unblock is selling you something. Someone who suggests putting your attention in your lower belly when you're spinning out is giving you good, testable advice.",
    ],
    practice: "For a week, when a feeling arrives, locate it physically before naming it. You're building the map from your own territory rather than borrowing someone else's.",
  },
  {
    id: "c-spirit-06",
    pillar: "spirit",
    title: "Your Own Voice as Instrument",
    subtitle: "Why traditions everywhere vocalize, and what happens when it's you.",
    evidence: "traditional",
    read: 3,
    body: [
      "Chant, mantra, toning, kirtan, psalmody, dhikr, overtone singing — vocalized practice appears independently across nearly every tradition that exists. Some of the effect is straightforwardly physical: sustained toning enforces a long, slow exhale, which is the same parasympathetic lever discussed in the breath entry. Some is social and rhythmic. And some is the plain fact that sound produced in your own chest is felt as well as heard.",
      "There's something specific about your own recorded voice. It's the one voice you can never hear from the outside in real time, and hearing it played back is famously uncomfortable — an interesting piece of data in itself. Getting past that discomfort and letting your own voice speak to you kindly, by name, tends to hit differently than reading the same words silently.",
      "This is the Voice Room's whole premise: build a library of your own voice, on your own side, recorded on your strong days, available on the days you can't produce it. You become both the one who reassures and the one reassured. Several traditions would call that a description of the higher self relationship. You don't have to agree to notice that it works.",
    ],
    practice: "Record thirty seconds of yourself saying the thing you most need to hear. Play it back tomorrow morning before you look at your phone.",
  },
  {
    id: "c-spirit-07",
    pillar: "spirit",
    title: "Shadow Work",
    subtitle: "The material you exiled is holding the power you're looking for.",
    evidence: "traditional",
    read: 4,
    body: [
      "Jung's shadow is everything about yourself you've disowned — not merely the ugly parts, but any quality that didn't fit the identity you had to build to be accepted. Aggression, need, ambition, softness, sexuality, rage, grief, brilliance. Whatever you learned would cost you love.",
      "Exiled material doesn't stop existing; it operates without supervision. The two classic tells are projection — you find yourself intensely irritated by a quality in others that you don't permit in yourself — and eruption, where the disowned thing takes the wheel at the worst possible moment. The strength of your reaction is the measure of your own disowning.",
      "The aim is integration, not exorcism. Every exiled part was originally doing a job — usually protecting you from something real at the time. The work is to find out what job it thought it had, thank it honestly, and give it a role that fits the life you're actually living now. You do not get to keep the power of a part you're still trying to kill.",
      "This is genuinely difficult work and it goes better with a witness. A therapist, a good group, a friend who won't flinch. Doing it alone in a journal at 2am is how people spiral rather than integrate. Use the app to track it; don't use the app as the only other person in the room.",
    ],
    caution:
      "Shadow work opens real material. If you have significant trauma history, do this with a trained professional. The app is a log, not a container.",
    practice: "Name the person who most irritates you. List the exact qualities. Then find where you do that, or where you desperately wish you were allowed to.",
  },
  {
    id: "c-spirit-08",
    pillar: "spirit",
    title: "Spiritual Bypassing",
    subtitle: "Using the practice to avoid the life.",
    evidence: "traditional",
    read: 3,
    body: [
      "John Welwood named this: using spiritual ideas and practices to sidestep unfinished emotional business, unmet needs, and practical responsibility. It is the most common failure mode among sincere, capable practitioners — precisely because it looks like progress from the inside.",
      "The tells are recognizable. Premature forgiveness that skips the anger entirely. 'Everything happens for a reason' deployed on your own fresh grief. Detachment that's actually avoidance. Rising above a conflict you should be having. Insight that never becomes a changed behavior. Serenity that evaporates the moment someone close to you challenges it.",
      "The correction is not less spirituality. It's insisting that the practice be accountable to your ordinary life. Are you easier to live with? Are your relationships more honest? Do you pay your debts, keep your appointments, apologize specifically? A connection to your higher self that doesn't show up in how you treat the person in front of you isn't a connection. It's a hobby.",
    ],
    practice: "Ask the person closest to you whether you've actually become easier or harder to be around in the last six months. Then don't defend.",
  },
  {
    id: "c-spirit-09",
    pillar: "spirit",
    title: "Difficult Territory",
    subtitle: "The dark night, the ego inflation, and how to tell if you're in trouble.",
    evidence: "mixed",
    read: 4,
    body: [
      "Contemplative traditions have always documented that this path has hard passages. The Christian dark night of the soul, the Theravada 'dukkha nanas', the Zen accounts of the deep pit — all describe periods of desolation, fear, loss of meaning, and dissolution that arrive not as failures of practice but as consequences of it. Contemporary research on meditation-related adverse effects finds these are more common than the wellness industry admits.",
      "The other direction is inflation: identifying with the numinous rather than relating to it. Jung wrote about this specifically and considered it a genuine psychological danger. It looks like special mission, chosen-ness, contempt for the unawakened, certainty that outruns evidence, and a slow drift away from anyone who'd contradict you. It feels magnificent from the inside, which is what makes it dangerous.",
      "Here is the practical triage. Difficult-but-workable: it hurts, but you're still sleeping, eating, working, and connected to people, and you can still question your own conclusions. Get support, reduce intensity, keep going. Get help now: sleep is going, you're losing time, other people seem unreal or hostile, you're certain in a way that can't be examined, you're isolating, you're spending money or making irreversible decisions on the strength of guidance, or someone who loves you is frightened.",
      "There is nothing unspiritual about medication, therapy, or a hospital. Every serious tradition has some version of the instruction to stop and get help. Choosing to stop is a form of discernment, not a failure of faith.",
    ],
    caution:
      "If you're having thoughts of harming yourself, stop the practice and reach a person tonight. In the US and Canada call or text 988. In the UK and Ireland call 116 123. Elsewhere, your local emergency number or findahelpline.com. This app is not equipped for that and would never claim to be.",
    practice: "Choose one person now, while you're steady, and give them explicit permission to tell you if you start seeming different. Write their name in your journal today.",
  },
  {
    id: "c-spirit-10",
    pillar: "spirit",
    title: "Integration",
    subtitle: "The unglamorous half nobody posts about.",
    evidence: "traditional",
    read: 3,
    body: [
      "Every tradition with real depth says a version of the same thing: the opening is not the accomplishment. What you do in the months afterward is. The mountaintop is comparatively easy; the descent, where the vision has to survive traffic and dishes and someone being rude to you, is where it either becomes character or evaporates into a story you tell.",
      "Practically, integration means three things. Translation: converting each insight into one specific changed behavior. Repetition: doing the small maintenance version daily rather than the enormous version occasionally. And ordinariness: letting yourself be a regular person having a regular Tuesday, without needing every hour to be significant.",
      "The measure of whether any of this is working is not how transcendent your peak experiences are. It's whether the people around you would say you've become more present, more honest, more reliable, and kinder — and whether you'd say your own life feels more like yours. That's the whole test. It's much harder than the visions, and it's the only part that lasts.",
    ],
    practice: "Take your most recent insight. Write the single behavior it implies. Put it on the calendar for tomorrow. That's integration; everything else is commentary.",
  },
];

export const codexById = Object.fromEntries(CODEX.map((c) => [c.id, c]));

export const PILLAR_INFO = {
  mind: {
    name: "Mind",
    tag: "Neuroscience & psychology",
    blurb: "How states, attention, memory, and fear actually work — so you stop fighting your own hardware.",
  },
  body: {
    name: "Body",
    tag: "Health & fitness",
    blurb: "The vessel. Sleep, light, breath, strength, aerobic base. Everything else in this app runs on top of these.",
  },
  spirit: {
    name: "Spirit",
    tag: "Practice & awakening",
    blurb: "The maps, the methods, the discernment, and the honest warnings about difficult territory.",
  },
};
