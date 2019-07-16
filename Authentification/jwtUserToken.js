const jwt = require("jsonwebtoken");

const createFromData = user => {
  const firstname = user.description;
  const lastname = user.sn.toUpperCase();

  return jwt.sign(
    {
      data: {
        firstname,
        lastname,
        displayName: `${firstname} ${lastname}`,
        email: user.mail,
        barcode: user.homeDirectory
      }
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const decode = token => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createFromData, decode };
