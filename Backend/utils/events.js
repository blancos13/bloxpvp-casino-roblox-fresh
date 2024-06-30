const { getIO } = require("./socket.js");
const Account = require("../models/account.js");

function emitEvent(eventName, data) {
  const io = getIO();
  io.emit(eventName, data);
}

async function emitBalanceUpdate(userIds) {
  const io = getIO();
  for (let userId of userIds) {
    const balance = await getBalance(userId);
    const accountId = userId.toString();
    io.to(accountId).emit("BALANCE_UPDATE", balance);
  }
}

async function getBalance(user) {
  const userAccount = await Account.findById(user);
  return userAccount.balance;
}

function getOnlineCount() {
  const io = getIO();
  return io.engine.clientsCount + 100;
}



module.exports = {
  emitEvent,
  getOnlineCount,
  emitBalanceUpdate,
};
