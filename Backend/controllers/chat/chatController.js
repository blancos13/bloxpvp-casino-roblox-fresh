const asyncHandler = require("express-async-handler");
const Account = require("../../models/account");
const Message = require("../../models/message");
const Giveaway = require("../../models/giveaway");
const GiveawayEntry = require("../../models/giveawayEntry");
const Item = require("../../models/item");
const { validationResult, body } = require("express-validator");
const { getOnlineCount, emitEvent } = require("../../utils/events");

exports.send_message = [
  body("message")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Message must be between 3 and 100 characters")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const sender = await Account.findById(req.user.id);
      if (!sender) {
        return res.status(404).send("Sender not found");
      }
      if (sender.level < 5) {
        return res.status(403).send("You must be at least level 5 to send messages");
      }
      const currentTime = Date.now();
      if (sender.lastMessage && currentTime - sender.lastMessage.getTime() < 2000) {
        return res.status(429).send("Please wait 2 seconds between each message");
      }
      await Account.findByIdAndUpdate(req.user.id, { lastMessage: currentTime });
      const message = req.body.message;

      const chatMessage = new Message({
        thumbnail: sender.thumbnail,
        username: sender.username,
        robloxId: sender.robloxId,
        timestamp: currentTime,
        message: message,
        rank: sender.rank,
      });
      await chatMessage.save();

      const messagesCount = await Message.countDocuments();
      if (messagesCount > 50) {
        const oldestMessage = await Message.findOne().sort({ timestamp: 1 });
        await Message.findByIdAndDelete(oldestMessage._id);
      }

      res.sendStatus(200);

      const messages = await getMessages();
      const onlineCount = await getOnlineCount();
      emitEvent("CHAT_UPDATE", { messages, onlineCount });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).send("The server could not process your request");
    }
  }),
];



exports.get_chat_info = asyncHandler(async (req, res, next) => {
  try {
    const [messages, onlineCount, giveaways] = await Promise.all([
      getMessages(),
      getOnlineCount(),
      getGiveaways(),
    ]);

    res.status(200).send({ messages, onlineCount, giveaways });
  } catch (error) {
    console.error("Error getting chat info:", error);
    return res.status(500).send("The server could not process your request");
  }
});

async function getMessages() {
  return await Message.find().sort({ $natural: -1 }).limit(40);
}

async function getGiveaways() {
  const newGiveaways = await Giveaway.find({ inactive: false }, { host: 0 })
    .sort({ $natural: -1 })
    .populate({
      path: "item",
      populate: {
        path: "item",
        model: Item,
      },
    });
  const userEntries = await GiveawayEntry.find({}, { joiner: 0 });
  return { newGiveaways, userEntries };
}
