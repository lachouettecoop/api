const nodemailer = require("nodemailer");
const { stripIndents } = require("common-tags");

const makeDevTransport = async () => {
  console.log("Using DEV transport");
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
};

const makeSMTPTransport = async (dsn) => {
  return await nodemailer.createTransport(dsn);
};

class DriveAPI {
  constructor(driveEmail, smtpDsn) {
    this.driveEmail = driveEmail;
    this.emailTransport =
      process.env.NODE_ENV === "production"
        ? makeSMTPTransport(smtpDsn)
        : makeDevTransport();
  }

  async passerCommande(data) {
    const transport = await this.emailTransport;

    const message = {
      from: `Commande Drive <${this.driveEmail}>`,
      to: `Drive <${this.driveEmail}>`,
      cc: data.email,
      subject: `Commande de ${data.nom}`,
      text: stripIndents`
        Bonjour,

        Une nouvelle commande est disponible sur https://drive.lachouettecoop.fr/preparation.html?${
          data.codeCommande
        }&nom=${encodeURIComponent(data.nom)}&telephone=${encodeURIComponent(
        data.telephone
      )}

        Elle a été passée par ${data.nom} (${data.email}).
        Son numéro de téléphone est le : ${data.telephone}.

        ${data.notes ? "Notes additionnelles : " + data.notes : ""}
      `,
    };

    console.log(message);
    const info = await transport.sendMail(message);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
    };
  }
}

module.exports = DriveAPI;
