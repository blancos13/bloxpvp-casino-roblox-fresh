/** @format */

const JWT_SECRET = 'fwnqifnwquiohi421nkmcwqkcmwqkfwqkl';
const PORT = process.env.PORT || 3000;
const HCAPTCHA_SECRET =
  process.env.HCAPTCHA_SECRET || "0x0000000000000000000000000000000000000000";
const MONGODB_URI = 'mongodb+srv://addddd:addddd@cluster0.sc5dux9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const TRANSACTION_SECRET = process.env.TRANSACTION_SECRET || "secret";
const XP_CONSTANT = process.env.XP_CONSTANT || 0.04;

module.exports = {
  JWT_SECRET,
  HCAPTCHA_SECRET,
  PORT,
  MONGODB_URI,
  TRANSACTION_SECRET,
  XP_CONSTANT,
};
