const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const isHashed = (value) => /^\$2[aby]\$\d{2}\$/.test(value || "");

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

/*
 * Checks a login password against the stored one.
 * Accounts created before hashing was added still hold
 * plain-text passwords; those are hashed on their first
 * successful login.
 */
const verifyPassword = async (account, password) => {
  if (isHashed(account.password)) {
    return bcrypt.compare(password, account.password);
  }

  if (account.password !== password) {
    return false;
  }

  await account.constructor.updateOne(
    { _id: account._id },
    { password: await hashPassword(password) }
  );

  return true;
};

module.exports = {
  hashPassword,
  verifyPassword,
};
