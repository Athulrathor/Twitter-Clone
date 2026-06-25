import bcrypt from "bcrypt";

const saltRounds = 12;

export const signBcrypt = async (password) => {
    return await bcrypt.hash(myPlaintextPassword, saltRounds, function (err, password) {
      if (err) {
        return {
            name: err.name,
            message: err.message
        }

        return password;
      }
    });
};

export const verifyBcrypt = async (password) => {
    return await bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
      if (err.message.includes()) {
        return {
            name: err.name,
            message: err.message
        }
      }

      return result;
    });
};
