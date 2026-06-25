export const generatePassword = (len = 14) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let pass = "";

  for (let i = 0; i < len; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }

  return pass;
};