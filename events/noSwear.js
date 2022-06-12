const LiveCollection = require("../classes/LiveCollection.js");
const swearWord = require("../models/swearWord.js");

const swearWords = new LiveCollection(swearWord);

module.exports = {
  id: "noswear",
  once: false,
  eventType: "messageCreate",

  execute: async (event, {}) => {
    if (event.author?.bot) return;
    if (swearWords.getAll().some((word) => event.content.toLowerCase().includes(word.word))) {
      return event.reply({ content: "No swear" });
    }
  },
};
