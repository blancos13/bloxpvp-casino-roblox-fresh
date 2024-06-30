const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const Account = require("../../models/account");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const { Webhook } = require("discord-webhook-node");
const transactionHook = new Webhook(
  "https://discord.com/api/webhooks/1225837252706435243/ZVzyp0IAPNI23MHJJ9IhcYbOX71vxrJei0exfIT09grKGVJlGuf-2kNV-DmoDmY1F-vY"
);
transactionHook.setUsername("BLOXPVP");
transactionHook.setAvatar(
  "https://s3-alpha-sig.figma.com/img/2b34/f172/b5c4249c2ed513c73212e742814f4b54?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vpjq2og4gzlTx9nsXfXmBo9FYg3ZkHzKSVKf5gejUHqvUUSJLQpFaYLYowTYFB~gJ32aPnVwnrwP~oqKz2gmcrfjBleISf2gdDhXRdHWAc~mDfU33sf3Y6fKYww1pfkEjC17RAWHV60TUwmjauNfPG1-6jTOjYYwUO-X4nS7Dz1tr9OWjDYe2jAccfV4mApd83RFYASsJbnDNqbd7BCfAbiFR8VKe2jmsSBavksA~cBSWpNb4W4f7Udw7GzRgTTyjSodO3XFDxOiuYbsNHc-cTFa~7AIei7bYzibtLXQM09NXZBKhirk6jUhqb9tHvTiwF37jYYXepZemEmnTyz7qw__"
);
const { body, validationResult } = require("express-validator");

const callback = [
  body("status").escape().trim(),
  body("price").escape().trim(),
  body("currency").escape().trim(),
  body("trackId").escape().trim(),
  body("address").escape().trim(),
  asyncHandler(async (req, res, next) => {
    const hmacReceived = req.headers["hmac"];
    const rawBody = req.rawBody.toString();
    const calculatedHmac = crypto
      .createHmac("sha512", process.env.OXAPAY_MERCHANT_API_KEY)
      .update(rawBody)
      .digest("hex");

    if (hmacReceived !== calculatedHmac) {
      console.error("Invalid HMAC signature");
      return res.status(400).send("Invalid HMAC signature");
    }

    const notification = req.body;

    if (notification.status === "Paid") {
      console.log("Payment confirmed: ", notification);
      try {
        const amountInUSD = notification.price;
        transactionHook.send(
          `${notification?.currency} deposit processed (Amount: $${
            Math.round(Number(notification.price) * 100) / 100
          })`
        );

        await updateAccountBalance(notification, amountInUSD);

        res.status(200).send("OK");
      } catch (error) {
        console.log(error);
        res.status(500).send("Error processing payment");
      }
    } else {
      console.log(
        `Payment status ${notification.status} for transaction:`,
        notification.trackId
      );
      res.status(200).send("OK");
    }
  }),
];

async function updateAccountBalance(notification, amountInUSD) {
  const address = notification.address;

  // Combine all address types into a single query
  const account = await Account.findOne({
    $or: [
      { BTCAddress: address },
      { ETHAddress: address },
      { LTCAddress: address },
      { BNBAddress: address },
      { USDTAddress: address },
    ],
  });

  if (account) {
    // Increment balance and deposited in a single database update
    await Account.findByIdAndUpdate(account._id, {
      $inc: { balance: amountInUSD, deposited: amountInUSD },
    });
    console.log("Account balance updated");
  } else {
    console.log("Account not found for the given deposit address");
  }
}

const createStaticAddress = [
  body("currency").escape().trim(),
  async (req, res) => {
    const userId = req.user.id;
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "Currency is required",
      });
    }

    const url = "https://api.oxapay.com/merchants/request/staticaddress";
    const data = JSON.stringify({
      merchant: process.env.OXAPAY_MERCHANT_API_KEY,
      currency: currency,
      callbackUrl: "https://api.bloxpvp.com/callback",
    });

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Extract the address from the response
      const { address } = response.data;

      if (currency == "BTC") {
        await Account.findByIdAndUpdate(userId, {
          BTCAddress: address,
        });
      } else if (currency == "ETH") {
        await Account.findByIdAndUpdate(userId, {
          ETHAddress: address,
        });
      } else if (currency == "LTC") {
        await Account.findByIdAndUpdate(userId, {
          LTCAddress: address,
        });
      } else if (currency == "BNB") {
        await Account.findByIdAndUpdate(userId, {
          BNBAddress: address,
        });
      } else if (currency == "USDT") {
        await Account.findByIdAndUpdate(userId, {
          USDTAddress: address,
        });
      }

      return res.status(200).send(address);
    } catch (error) {
      console.error("Error creating static address:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while creating the static address.",
      });
    }
  },
];

module.exports = {
  createStaticAddress,
  callback,
};
