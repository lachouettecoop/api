const nodemailer = require("nodemailer");
const { stripIndents } = require("common-tags");
const got = require("got");

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
  constructor(driveEmail, smtpDsn, driveAdminUrl) {
    this.driveEmail = driveEmail;
    this.driveAdminUrl = driveAdminUrl;
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
      )}&ts=${Date.now()}

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

    this.sendToAdmin(data);

    return {
      success: true,
    };
  }

  async sendToAdmin(data) {
    const produits = data.codeCommande.split("&").map((param) => {
      const [odoo_id, quantite] = param.split("=");
      return {
        odoo_id,
        quantite,
      };
    });

    const payload = {
      nom_chouettos: data.nom,
      total: data.total,
      notes: data.notes,
      code: data.codeCommande,
      chouettos: {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
      },
      produits: produits,
    };

    console.log("sending order to admin", payload);
    try {
      await got.post(`${this.driveAdminUrl}/commandes`, {
        json: true,
        body: payload,
      });

      console.log("OK RESPONSE");
    } catch (e) {
      console.log("OOPS", JSON.stringify(e.body, null, 2));
    }
  }
}

module.exports = DriveAPI;
