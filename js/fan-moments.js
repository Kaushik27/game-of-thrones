// The emotional index of the realm: scenes fans remember before they
// remember the episode number. These are editorial anchors, not a replacement
// for the source records in events.js / episodes.js.
(function installFanMoments(global) {
  "use strict";

  const moments = [
    {
      id: "ice-before-execution",
      title: "The sword is cleaned",
      kicker: "The price of duty",
      characterId: "ned-stark",
      quoteId: "q2",
      episodeId: "s01e09",
      location: "King's Landing · The execution yard",
      image: "assets/ui/memory-ice-sword.png",
      line: "The man who passes the sentence should swing the sword.",
      fanNote: "The moment the show tells you exactly what kind of man Ned is—and what that kind of man cannot survive.",
      consequence: "Honor stops being a shield and becomes the blade.",
      tags: ["duty", "honor", "loss"]
    },
    {
      id: "red-wedding-doors",
      title: "The doors close",
      kicker: "A feast becomes a trap",
      characterId: "robb-stark",
      quoteId: "q24",
      episodeId: "s03e09",
      location: "The Twins · The Red Wedding",
      image: "assets/ui/memory-red-doors.png",
      line: "The Lannisters are not the only ones who pay their debts.",
      fanNote: "The music changes, the doors shut, and every promise in the room becomes a memory at once.",
      consequence: "A wedding becomes a map-changing act of violence.",
      tags: ["betrayal", "family", "war"]
    },
    {
      id: "army-of-the-dead",
      title: "The dead are waiting",
      kicker: "The world gets larger",
      characterId: "jon-snow",
      quoteId: "q6",
      episodeId: "s05e08",
      location: "Hardhome · Beyond the Wall",
      image: "assets/ui/memory-dead-army.png",
      line: "I know nothing, Jon Snow.",
      fanNote: "Jon does not win this scene. He survives it—and carries the terror back to people who still think the war is political.",
      consequence: "The enemy stops being a rumor and becomes a horizon.",
      tags: ["fear", "survival", "the-long-night"]
    },
    {
      id: "fire-and-ash",
      title: "A queen walks into fire",
      kicker: "Birth in the ashes",
      characterId: "daenerys-targaryen",
      quoteId: "q8",
      episodeId: "s03e04",
      location: "Astapor · The dragon's command",
      image: "assets/ui/essos-journey-bg.jpg",
      line: "Dracarys.",
      fanNote: "A single word turns the power dynamic inside out. The scene is thrilling because the choice has already been made.",
      consequence: "Mercy and conquest begin sharing the same fire.",
      tags: ["power", "freedom", "fire"]
    },
    {
      id: "arya-names-the-dead",
      title: "A list becomes a life",
      kicker: "The girl who remembers",
      characterId: "arya-stark",
      quoteId: "q10",
      episodeId: "s07e01",
      location: "The Riverlands · The road home",
      image: "assets/ui/memory-names-road.png",
      line: "What do we say to the god of death? Not today.",
      fanNote: "Arya's power is not that she forgets. It is that she remembers every name and chooses what to do with it.",
      consequence: "Revenge becomes a ritual—and then a choice.",
      tags: ["identity", "revenge", "memory"]
    },
    {
      id: "tyrion-trial",
      title: "The trial breaks open",
      kicker: "A man refuses the script",
      characterId: "tyrion-lannister",
      quoteId: "q4",
      episodeId: "s04e06",
      location: "King's Landing · The Iron Throne",
      image: "assets/ui/memory-trial-candle.png",
      line: "Never forget what you are. The rest of the world will not.",
      fanNote: "The courtroom stops pretending to be fair. Tyrion's final act of control is to refuse everyone else's version of him.",
      consequence: "The accused becomes the only person in the room speaking plainly.",
      tags: ["voice", "justice", "identity"]
    },
    {
      id: "hold-the-door",
      title: "Hold the door",
      kicker: "The cost of a name",
      characterId: "hodor",
      quoteId: "q18",
      episodeId: "s06e05",
      location: "The cave of the three-eyed raven",
      image: "assets/ui/memory-hold-door.png",
      line: "Hodor.",
      fanNote: "A joke becomes a lifetime of sacrifice. The reveal works because the smallest word contains an entire life.",
      consequence: "A door closes, and the story's idea of fate changes forever.",
      tags: ["sacrifice", "love", "fate"]
    }
  ];

  global.FAN_MOMENTS = Object.freeze(moments.map(moment => Object.freeze({ ...moment, tags: Object.freeze(moment.tags.slice()) })));
  global.FAN_MOMENT_BY_ID = Object.freeze(Object.fromEntries(global.FAN_MOMENTS.map(moment => [moment.id, moment])));
})(window);
