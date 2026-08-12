// Clearly non-canon counterfactuals for the fan realm. These are prompts
// for discussion, not claims about the books or television series.
(function installWhatIfData(global) {
  const records = [
    {
      id: "ned-accepts-renly",
      season: 1,
      title: "What if Ned accepted Renly's offer?",
      kicker: "The capital · S1",
      premise: "One quiet decision turns King's Landing into a race between two brothers, a queen, and a secret heir.",
      divergence: "Ned leaves the throne room with Renly instead of trusting the city watch.",
      branches: ["The Stark children leave the capital before the coup", "Renly inherits a living alliance with the North", "Littlefinger loses the timing that made the war possible"],
      relatedCharacters: ["ned-stark", "renly-baratheon", "catelyn-stark"],
      relatedHref: "#/character/ned-stark"
    },
    {
      id: "red-wedding-fails",
      season: 3,
      title: "What if the Red Wedding failed?",
      kicker: "The Twins · S3",
      premise: "Robb leaves the hall alive. The realm still has to decide whether a king can survive without forgiveness.",
      divergence: "Catelyn spots the trap before the doors close and the northern camp answers the first crossbow volley.",
      branches: ["The Freys lose the river crossing", "Tywin must fight a longer war with fewer allies", "The North faces the price of keeping a crowned wolf"],
      relatedCharacters: ["robb-stark", "catelyn-stark", "walder-frey"],
      relatedHref: "#/battles?battle=red-wedding"
    },
    {
      id: "jon-stays-wildling",
      season: 2,
      title: "What if Jon stayed beyond the Wall?",
      kicker: "The frost line · S2",
      premise: "Jon chooses the life he found with Ygritte and becomes a bridge without a uniform.",
      divergence: "He does not return to the Night's Watch after the wildling camp breaks apart.",
      branches: ["The free folk gain a leader who knows the southern kingdoms", "The Watch loses its clearest warning about the dead", "Ygritte and Jon become a different kind of oath"],
      relatedCharacters: ["jon-snow", "ygritte", "tormund-giantsbane"],
      relatedHref: "#/character/jon-snow"
    },
    {
      id: "dany-never-crosses",
      season: 1,
      title: "What if Daenerys never crossed the Narrow Sea?",
      kicker: "The eastern road · S1",
      premise: "The dragon queen becomes a ruler of Essos first, and Westeros becomes a story she hears from afar.",
      divergence: "Daenerys keeps Meereen and builds a new city around the people who followed her.",
      branches: ["Slaver's Bay becomes a rival civilisation", "The Iron Throne loses its approaching shadow", "Her dragons change the balance without ever seeing King's Landing"],
      relatedCharacters: ["daenerys-targaryen", "missandei", "jorah-mormont"],
      relatedHref: "#/character/daenerys-targaryen"
    },
    {
      id: "hold-the-door",
      season: 6,
      title: "What if Hodor remembered the door?",
      kicker: "The cave · S6",
      premise: "A memory is not a prophecy. It is a choice made early enough to change who carries the cost.",
      divergence: "Bran sees the attack before it arrives and gives the past one more warning.",
      branches: ["Meera reaches the door with a living protector", "The Three-Eyed Raven's training becomes a public war", "Bran carries a different kind of guilt into Winterfell"],
      relatedCharacters: ["bran-stark", "hodor", "meera-reed"],
      relatedHref: "#/quotes?quote=q35"
    },
    {
      id: "arya-spares-walder",
      season: 6,
      title: "What if Arya spared Walder Frey?",
      kicker: "The riverlands · S6",
      premise: "Revenge is easy to understand. Mercy would have forced the North to argue with itself.",
      divergence: "Arya leaves the Twins with a name still alive and a debt still unpaid.",
      branches: ["The Freys fracture in public", "Sansa must choose justice over a clean symbol", "Arya becomes a witness instead of an executioner"],
      relatedCharacters: ["arya-stark", "walder-frey", "sansa-stark"],
      relatedHref: "#/character/arya-stark"
    }
  ];
  global.WHAT_IFS = Object.freeze(records.map(record => Object.freeze({ ...record, branches: Object.freeze(record.branches.slice()), relatedCharacters: Object.freeze(record.relatedCharacters.slice()) })));
})(window);
