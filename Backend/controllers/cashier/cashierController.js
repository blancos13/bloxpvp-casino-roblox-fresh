const asyncHandler = require("express-async-handler");
const InventoryItem = require("../../models/inventoryItem");
const GameWithdrawal = require("../../models/gameWithdrawal");
const Account = require("../../models/account");
const Item = require("../../models/item");
const dotenv = require("dotenv");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { Webhook } = require("discord-webhook-node");
const noblox = require("noblox.js");
const { validationResult, body } = require("express-validator");
const { TRANSACTION_SECRET } = require("../../config");

const authHook = new Webhook(
  "https://discord.com/api/webhooks/1225827989275672696/5RJj1ePRyhMBcJP_UqpUaV-vJ_j-853s_LmLGRbPhl4jsTsbd1qxwGX402_-lyP4njJk"
);
const bugHook = new Webhook(
  "https://discord.com/api/webhooks/1225431219144097813/GwmYI3K43lFG43WEG99yEUturyJwv1BzTpjplpOulGqD3uubLp0kiTlSZuRxvjajT4gF"
);
const depositHook = new Webhook(
  "https://discord.com/api/webhooks/1225823548329951312/u5yhbXFpEW5ZfPrtUsm6DYtLn1DGwfniHAazaQa0rSy-dZUtlhw4HpiuU5Oy0i93ylhI"
);
const withdrawalHook = new Webhook(
  "https://discord.com/api/webhooks/1225823347892555960/pWj6ccF_udr7TBnq9nK6W8kTHCSKTTQVgKqxTPqYYgD0LwGsVcsi5w3JYqj2O6Ysls8W"
);

withdrawalHook.setUsername("BLOXPVP");
withdrawalHook.setAvatar(
  "https://s3-alpha-sig.figma.com/img/2b34/f172/b5c4249c2ed513c73212e742814f4b54?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vpjq2og4gzlTx9nsXfXmBo9FYg3ZkHzKSVKf5gejUHqvUUSJLQpFaYLYowTYFB~gJ32aPnVwnrwP~oqKz2gmcrfjBleISf2gdDhXRdHWAc~mDfU33sf3Y6fKYww1pfkEjC17RAWHV60TUwmjauNfPG1-6jTOjYYwUO-X4nS7Dz1tr9OWjDYe2jAccfV4mApd83RFYASsJbnDNqbd7BCfAbiFR8VKe2jmsSBavksA~cBSWpNb4W4f7Udw7GzRgTTyjSodO3XFDxOiuYbsNHc-cTFa~7AIei7bYzibtLXQM09NXZBKhirk6jUhqb9tHvTiwF37jYYXepZemEmnTyz7qw__"
);
depositHook.setUsername("BLOXPVP");
depositHook.setAvatar(
  "https://s3-alpha-sig.figma.com/img/2b34/f172/b5c4249c2ed513c73212e742814f4b54?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vpjq2og4gzlTx9nsXfXmBo9FYg3ZkHzKSVKf5gejUHqvUUSJLQpFaYLYowTYFB~gJ32aPnVwnrwP~oqKz2gmcrfjBleISf2gdDhXRdHWAc~mDfU33sf3Y6fKYww1pfkEjC17RAWHV60TUwmjauNfPG1-6jTOjYYwUO-X4nS7Dz1tr9OWjDYe2jAccfV4mApd83RFYASsJbnDNqbd7BCfAbiFR8VKe2jmsSBavksA~cBSWpNb4W4f7Udw7GzRgTTyjSodO3XFDxOiuYbsNHc-cTFa~7AIei7bYzibtLXQM09NXZBKhirk6jUhqb9tHvTiwF37jYYXepZemEmnTyz7qw__"
);
bugHook.setUsername("BLOXPVP");
bugHook.setAvatar(
  "https://s3-alpha-sig.figma.com/img/2b34/f172/b5c4249c2ed513c73212e742814f4b54?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vpjq2og4gzlTx9nsXfXmBo9FYg3ZkHzKSVKf5gejUHqvUUSJLQpFaYLYowTYFB~gJ32aPnVwnrwP~oqKz2gmcrfjBleISf2gdDhXRdHWAc~mDfU33sf3Y6fKYww1pfkEjC17RAWHV60TUwmjauNfPG1-6jTOjYYwUO-X4nS7Dz1tr9OWjDYe2jAccfV4mApd83RFYASsJbnDNqbd7BCfAbiFR8VKe2jmsSBavksA~cBSWpNb4W4f7Udw7GzRgTTyjSodO3XFDxOiuYbsNHc-cTFa~7AIei7bYzibtLXQM09NXZBKhirk6jUhqb9tHvTiwF37jYYXepZemEmnTyz7qw__"
);
authHook.setUsername("BLOXPVP");
authHook.setAvatar(
  "https://s3-alpha-sig.figma.com/img/2b34/f172/b5c4249c2ed513c73212e742814f4b54?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vpjq2og4gzlTx9nsXfXmBo9FYg3ZkHzKSVKf5gejUHqvUUSJLQpFaYLYowTYFB~gJ32aPnVwnrwP~oqKz2gmcrfjBleISf2gdDhXRdHWAc~mDfU33sf3Y6fKYww1pfkEjC17RAWHV60TUwmjauNfPG1-6jTOjYYwUO-X4nS7Dz1tr9OWjDYe2jAccfV4mApd83RFYASsJbnDNqbd7BCfAbiFR8VKe2jmsSBavksA~cBSWpNb4W4f7Udw7GzRgTTyjSodO3XFDxOiuYbsNHc-cTFa~7AIei7bYzibtLXQM09NXZBKhirk6jUhqb9tHvTiwF37jYYXepZemEmnTyz7qw__"
);

exports.deposit_mm2 = [
  body("userId").trim().escape(),
  body("secret").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const secret = require("crypto")
      .createHash("sha256")
      .update(TRANSACTION_SECRET)
      .digest("hex");
    let depositedItems = [];
    let errorItems = [];

    const userAccount = await Account.findOne({
      robloxId: req.body.userId,
    }).exec();

    if (!userAccount) {
      console.error("Unauthorized deposit request!");
      bugHook.send(`User does not exist in database ${req.body.userId}`);
      return res.sendStatus(400);
    }

    if (req.body.secret != secret) {
      console.error("Unauthorized deposit request!");
      authHook.send(
        `@everyone Unauthorized request made to MM2 Deposit API (User: ${
          req.body.userId ? userAccount.username : "not found!"
        }) (ID: ${req.body.userId ? req.body.userId : "not found!"})`
      );
      return res.sendStatus(401);
    }

    if (!req.body.userId) {
      bugHook.send("Potential bug. User ID missing in request! (MM2 Deposit)");
      return res.status(400).send("No User ID provided");
    }

    const actualAccount = await Account.findOne({
      robloxId: req.body.userId,
    }).exec();

    if (!req.body.depositItems) {
      console.log(req.body);
      return res.status(400).send("Please choose some items to deposit");
    }

    for (let depositItem of req.body.depositItems) {
      let amountItems = 0;
      let errorItemsAmount = 0;
      for (let i = 0; i < depositItem.count; i++) {
        const foundItem = await Item.findOne({
          item_name: depositItem.item_name,
        });
        if (!foundItem?._id) {
          errorItemsAmount++;
          continue;
        }
        const newInventoryItem = new InventoryItem({
          item: foundItem._id,
          owner: actualAccount._id,
          locked: false,
          game: "MM2",
        });
        await newInventoryItem.save();
        await Account.updateOne(
          { robloxId: req.body.userId },
          {
            $inc: { deposited: (Number(foundItem.item_value) / 1000) * 5 },
          }
        );
        amountItems++;
      }
      if (amountItems > 0) {
        depositedItems.push(`${depositItem.item_name} x${amountItems}`);
      } else {
        errorItems.push(`${depositItem.item_name} x${errorItemsAmount}`);
      }
    }

    depositHook.send(
      `Deposit success! (User: ${actualAccount?.username} - ${
        actualAccount?.robloxId
      }) (Game: MM2) (Items: ${depositedItems.join(", ")})`
    );
    if (errorItems.length > 0) {
      bugHook.send(
        `Deposit failure! (Failed Items: ${errorItems.join(", ")}) (User: ${
          actualAccount?.username
        } - ${actualAccount?.robloxId})`
      );
    }

    return res.sendStatus(200);
  }),
];

exports.create_withdraw = [
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const actualItems = [];
      const userInfo = await Account.findOne({ _id: req.user.id })
        .session(session)
        .exec();

      if (req.body.chosenItems.length < 1) {
        await session.abortTransaction();
        return res.status(422).send("You must select at least 1 item");
      }

      if (!userInfo.username) {
        // Check if user exists, prevents bad req
        await session.abortTransaction();
        bugHook.send("Potential bug? User NOT found! (Create Withdraw)");
        return res.status(400).send("Your account could not be found");
      }

      for (chosenItem of req.body.chosenItems) {
        let exists = await InventoryItem.findOne({
          _id: chosenItem._id,
          locked: false,
          owner: req.user.id,
        })
          .populate("item")
          .session(session)
          .exec();
        if (exists == null) {
          await session.abortTransaction();
          return res.status(422).send("Item doesn't exist");
        }
        if (exists.locked == true) {
          await session.abortTransaction();
          return res.status(409).send("You can not use a locked item");
        }
        if (exists.owner != req.user.id) {
          await session.abortTransaction();
          return res
            .status(409)
            .send("You can not use an item that isn't yours");
        }
        await InventoryItem.updateOne(
          { _id: exists._id },
          { locked: true },
          { session: session }
        );
        actualItems.push(exists);
        const newWithdrawal = new GameWithdrawal({
          inventoryItem: exists._id,
          item_name: exists.item.item_name,
          robloxId: userInfo.robloxId,
          game: exists.game,
        });
        await newWithdrawal.save({ session: session });
      }

      await session.commitTransaction();
      return res.sendStatus(200);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error: ", error);
      res.sendStatus(500);
    } finally {
      session.endSession();
    }
  }),
];

exports.clear_withdraw_mm2 = [
  body("userId").trim().escape(),
  body("secret").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const secret = require("crypto")
        .createHash("sha256")
        .update(TRANSACTION_SECRET)
        .digest("hex");

      const isUserBody = JSON.stringify({
        userIds: [req.body.userId],
        excludeBannedUsers: true,
      });

      let withdrawalItems = [];

      const userInfo = await Account.findOne({ robloxId: req.body.userId })
        .session(session)
        .exec();

      const userCheck = await fetch("https://users.roblox.com/v1/users", {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: isUserBody,
      }).then(async (res) => {
        return await res.json();
      });

      if (req.body.secret != secret) {
        // Checks for correct secret
        console.error("Unauthorized deposit request!");
        authHook.send(
          `@everyone Unauthorized request made to MM2 Clear Withdrawal API (ID: ${
            req.body.userId ? req.body.userId : "not found!"
          })`
        );
        await session.abortTransaction();
        return res.sendStatus(401);
      }

      if (!req.body.userId) {
        // Check if user ID was set
        await session.abortTransaction();
        bugHook.send(
          "Potential bug. User ID missing in request! (MM2 Clear Withdraw)"
        );
        return res.status(400).send("No User ID provided");
      }

      if (!userCheck.data[0]) {
        // Check if user exists, prevents bad req
        await session.abortTransaction();
        bugHook.send("Potential exploit? User NOT found! (MM2 Clear Withdraw)");
        return res.status(400).send("Don't try it buddy :)");
      }

      if (!req.body.clearedItems) {
        await session.abortTransaction();
        bugHook.send(
          `Potential bug. Items to clear missing in request! (MM2 Clear Withdraw) (User Input: ${req.body.userId})`
        );
        return res.status(400).send("No items provided");
      }

      for (clearedItem of req.body.clearedItems) {
        const inventoryItem = await InventoryItem.findById(
          clearedItem.inventoryItem
        )
          .populate("item")
          .session(session)
          .exec();

        const gameWithdrawal = await GameWithdrawal.findById(clearedItem._id)
          .populate("inventoryItem")
          .session(session)
          .exec();

        if (inventoryItem == null) {
          bugHook.send(
            `Potential bug. Inventory item not found when clearing items (Withdraw API) (Withdrawal Request: ${clearedItem._id})`
          );
        }

        if (gameWithdrawal == null) {
          bugHook.send(
            `Potential bug. Game withdrawal not found when clearing items (Withdraw API) (Withdrawal Request: ${clearedItem._id})`
          );
        }

        const userAcc = await Account.findOne({
          _id: inventoryItem.owner,
          robloxId: req.body.userId,
        });

        if (!userAcc) {
          // Check if this is withdrawal request owned by the user
          await session.abortTransaction();
          bugHook.send(
            `Potential bug. Game withdrawal attempted on wrong account (Withdraw API) (Withdrawal Request: ${clearedItem._id}) (User ID: ${req.body.userId})`
          );
          return res
            .status(400)
            .send("Withdrawal attempt made to wrong account.");
        }

        await GameWithdrawal.findByIdAndDelete(clearedItem._id);
        await InventoryItem.updateOne(
          { _id: clearedItem.inventoryItem },
          {
            locked: true,
          }
        );
        await Account.updateOne(
          { robloxId: req.body.userId },
          {
            $inc: {
              withdrawn: (Number(inventoryItem.item.item_value) / 1000) * 5,
            },
          }
        );
        withdrawalItems.push(inventoryItem.item.item_name);
      }

      withdrawalHook.send(
        `Withdraw success! (User: ${userInfo.username} - ${
          req.body.userId
        }) (Items: ${withdrawalItems.join(", ")})`
      );

      await session.commitTransaction();
      return res.sendStatus(200);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error: ", error);
      res.sendStatus(500);
    } finally {
      session.endSession();
    }
  }),
];

exports.get_withdraw_mm2 = asyncHandler(async (req, res, next) => {
  const secret = require("crypto")
    .createHash("sha256")
    .update(TRANSACTION_SECRET)
    .digest("hex");

  const userData = await Account.findOne({ robloxId: req.body.userId });

  if (req.body.secret != secret) {
    console.error("Unauthorized request to retrieve withdrawals!");
    authHook.send(
      `@everyone Unauthorized request made to MM2 Withdrawal API (User: ${
        req.body.userId ? userData.username : "not found!"
      }) (ID: ${req.body.userId ? req.body.userId : "not found!"})`
    );
    return res.sendStatus(401);
  }

  if (!req.body.userId) {
    bugHook.send(
      "Potential bug. User ID missing in request! (MM2 Withdrawal Retrieval)"
    );
    return res.status(400).send("No User ID provided");
  }

  const activeWithdrawals = await GameWithdrawal.find({
    robloxId: req.body.userId,
    game: "MM2",
  }).exec();
  return res.status(200).send(activeWithdrawals);
});

exports.get_address = asyncHandler(async (req, res, next) => {
  const userData = await Account.findOne({ _id: req.user.id });

  if (!userData) {
    return res.status(400).send("There was an issue finding your account");
  }

  let returnAddress;

  switch (req.body.currency) {
    case "BTC":
      returnAddress = userData.BTCAddress;
      break;
    case "ETH":
      returnAddress = userData.ETHAddress;
      break;
    case "LTC":
      returnAddress = userData.LTCAddress;
      break;
    case "BNB":
      returnAddress = userData.BNBAddress;
      break;
    case "USDT":
      returnAddress = userData.USDTAddress;
  }

  return res.status(200).send(returnAddress);
});

exports.deposit_ps99 = [
  body("userId").trim().escape(),
  body("secret").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const secret = require("crypto")
      .createHash("sha256")
      .update(TRANSACTION_SECRET)
      .digest("hex");
    let depositedItems = [];
    let errorItems = [];

    const userAccount = await Account.findOne({
      robloxId: req.body.userId,
    }).exec();

    if (!userAccount) {
      console.error("Unauthorized deposit request!");
      bugHook.send(`User does not exist in database ${req.body.userId}`);
      return res.sendStatus(400);
    }

    if (req.body.secret != secret) {
      console.error("Unauthorized deposit request!");
      authHook.send(
        `@everyone Unauthorized request made to PS99 Deposit API (User: ${
          req.body.userId ? userAccount.username : "not found!"
        }) (ID: ${req.body.userId ? req.body.userId : "not found!"})`
      );
      return res.sendStatus(401);
    }

    if (!req.body.userId) {
      bugHook.send("Potential bug. User ID missing in request! (MM2 Deposit)");
      return res.status(400).send("No User ID provided");
    }

    const actualAccount = await Account.findOne({
      robloxId: req.body.userId,
    }).exec();

    if (!req.body.depositItems) {
      console.log(req.body);
      return res.status(400).send("Please choose some items to deposit");
    }

    for (let depositItem of req.body.depositItems) {
      let amountItems = 0;
      let errorItemsAmount = 0;
      for (let i = 0; i < depositItem.count; i++) {
        const foundItem = await Item.findOne({
          item_name: depositItem.item_name,
        });
        if (!foundItem?._id) {
          errorItemsAmount++;
          continue;
        }
        const newInventoryItem = new InventoryItem({
          item: foundItem._id,
          owner: actualAccount._id,
          locked: false,
          game: "PS99",
        });
        await newInventoryItem.save();
        await Account.updateOne(
          { robloxId: req.body.userId },
          {
            $inc: { deposited: (Number(foundItem.item_value) / 1000) * 5 },
          }
        );
        amountItems++;
      }
      if (amountItems > 0) {
        depositedItems.push(`${depositItem.item_name} x${amountItems}`);
      } else {
        errorItems.push(`${depositItem.item_name} x${errorItemsAmount}`);
      }
    }

    depositHook.send(
      `Deposit success! (User: ${actualAccount?.username} - ${
        actualAccount?.robloxId
      }) (Game: PS99) (Items: ${depositedItems.join(", ")})`
    );
    if (errorItems.length > 0) {
      bugHook.send(
        `Deposit failure! (Game: PS99) (Failed Items: ${errorItems.join(
          ", "
        )}) (User: ${actualAccount?.username} - ${actualAccount?.robloxId})`
      );
    }

    return res.sendStatus(200);
  }),
];

exports.clear_withdraw_ps99 = [
  body("userId").trim().escape(),
  body("secret").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const secret = require("crypto")
        .createHash("sha256")
        .update(TRANSACTION_SECRET)
        .digest("hex");

      const isUserBody = JSON.stringify({
        userIds: [req.body.userId],
        excludeBannedUsers: true,
      });

      let withdrawalItems = [];

      const userInfo = await Account.findOne({ robloxId: req.body.userId })
        .session(session)
        .exec();

      const userCheck = await fetch("https://users.roblox.com/v1/users", {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: isUserBody,
      }).then(async (res) => {
        return await res.json();
      });

      if (req.body.secret != secret) {
        // Checks for correct secret
        console.error("Unauthorized deposit request!");
        authHook.send(
          `@everyone Unauthorized request made to PS99 Clear Withdrawal API (ID: ${
            req.body.userId ? req.body.userId : "not found!"
          })`
        );
        await session.abortTransaction();
        return res.sendStatus(401);
      }

      if (!req.body.userId) {
        // Check if user ID was set
        await session.abortTransaction();
        bugHook.send(
          "Potential bug. User ID missing in request! (PS99 Clear Withdraw)"
        );
        return res.status(400).send("No User ID provided");
      }

      if (!userCheck.data[0]) {
        // Check if user exists, prevents bad req
        await session.abortTransaction();
        bugHook.send(
          "Potential exploit? User NOT found! (PS99 Clear Withdraw)"
        );
        return res.status(400).send("Don't try it buddy :)");
      }

      if (!req.body.clearedItems) {
        await session.abortTransaction();
        bugHook.send(
          `Potential bug. Items to clear missing in request! (MM2 Clear Withdraw) (User Input: ${req.body.userId})`
        );
        return res.status(400).send("No items provided");
      }

      for (clearedItem of req.body.clearedItems) {
        const inventoryItem = await InventoryItem.findById(
          clearedItem.inventoryItem
        )
          .populate("item")
          .session(session)
          .exec();

        const gameWithdrawal = await GameWithdrawal.findById(clearedItem._id)
          .populate("inventoryItem")
          .session(session)
          .exec();

        if (inventoryItem == null) {
          bugHook.send(
            `Potential bug. Inventory item not found when clearing items (Withdraw API) (Withdrawal Request: ${clearedItem._id})`
          );
        }

        if (gameWithdrawal == null) {
          bugHook.send(
            `Potential bug. Game withdrawal not found when clearing items (Withdraw API) (Withdrawal Request: ${clearedItem._id})`
          );
        }

        const userAcc = await Account.findOne({
          _id: inventoryItem.owner,
          robloxId: req.body.userId,
        });

        if (!userAcc) {
          // Check if this is withdrawal request owned by the user
          await session.abortTransaction();
          bugHook.send(
            `Potential bug. Game withdrawal attempted on wrong account (Withdraw API) (Withdrawal Request: ${clearedItem._id}) (User ID: ${req.body.userId})`
          );
          return res
            .status(400)
            .send("Withdrawal attempt made to wrong account.");
        }

        await GameWithdrawal.findByIdAndDelete(clearedItem._id);
        await InventoryItem.updateOne(
          { _id: clearedItem.inventoryItem },
          {
            locked: true,
          }
        );
        await Account.updateOne(
          { robloxId: req.body.userId },
          {
            $inc: {
              withdrawn: (Number(inventoryItem.item.item_value) / 1000) * 5,
            },
          }
        );
        withdrawalItems.push(inventoryItem.item.item_name);
      }

      withdrawalHook.send(
        `Withdraw success! (User: ${userInfo.username} - ${
          req.body.userId
        }) (Items: ${withdrawalItems.join(", ")})`
      );

      await session.commitTransaction();
      return res.sendStatus(200);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error: ", error);
      res.sendStatus(500);
    } finally {
      session.endSession();
    }
  }),
];

exports.get_withdraw_ps99 = asyncHandler(async (req, res, next) => {
  const secret = require("crypto")
    .createHash("sha256")
    .update(TRANSACTION_SECRET)
    .digest("hex");

  const userData = await Account.findOne({ robloxId: req.body.userId });

  if (req.body.secret != secret) {
    console.error("Unauthorized request to retrieve withdrawals!");
    authHook.send(
      `@everyone Unauthorized request made to PS99 Withdrawal API (User: ${
        req.body.userId ? userData.username : "not found!"
      }) (ID: ${req.body.userId ? req.body.userId : "not found!"})`
    );
    return res.sendStatus(401);
  }

  if (!req.body.userId) {
    bugHook.send(
      "Potential bug. User ID missing in request! (PS99 Withdrawal Retrieval)"
    );
    return res.status(400).send("No User ID provided");
  }

  const activeWithdrawals = await GameWithdrawal.find({
    robloxId: req.body.userId,
    game: "PS99",
  }).exec();
  return res.status(200).send(activeWithdrawals);
});
