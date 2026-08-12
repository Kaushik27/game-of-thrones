// Curated editorial metadata for the Voices of the Realm realm.
// The quote text itself remains canonical in js/quotes.js; this file only
// decides which lines to spotlight and how to group them for discovery.
(function exposeQuoteCuration(global) {
  const collections = [
    {
      id: "power",
      label: "Power",
      description: "The lines that redraw the board.",
      quoteIds: ["q5", "q12", "q13", "q16", "q28"]
    },
    {
      id: "identity",
      label: "Identity",
      description: "Names, masks, and the selves beneath them.",
      quoteIds: ["q4", "q6", "q9", "q11", "q39"]
    },
    {
      id: "duty",
      label: "Duty",
      description: "Promises that cost more than crowns.",
      quoteIds: ["q2", "q19", "q20", "q27", "q33"]
    },
    {
      id: "survival",
      label: "Survival",
      description: "Hard truths for a hard winter.",
      quoteIds: ["q1", "q14", "q21", "q25", "q37"]
    },
    {
      id: "freedom",
      label: "Freedom",
      description: "The words that refuse to kneel.",
      quoteIds: ["q7", "q10", "q15", "q34", "q35"]
    }
  ].map(collection => Object.freeze({
    ...collection,
    quoteIds: Object.freeze(collection.quoteIds.slice())
  }));

  global.QUOTE_COLLECTIONS = Object.freeze(collections);
  global.FEATURED_QUOTE_IDS = Object.freeze([
    "q5", "q13", "q2", "q7", "q10", "q41", "q16", "q19", "q34", "q15"
  ]);
})(window);
