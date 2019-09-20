const jwt = require("jsonwebtoken");

const createFromData = user => {
  const prenom = user.description;
  const nom = user.sn.toUpperCase();

  return jwt.sign(
    {
      data: {
        prenom,
        nom,
        nomAffichage: `${prenom} ${nom}`,
        email: user.mail,
        codeBarre: user.homeDirectory
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
