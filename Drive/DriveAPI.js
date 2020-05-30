const got = require("got");

class DriveAPI {
  constructor(driveAdminUrl) {
    this.driveAdminUrl = driveAdminUrl;
  }

  async passerCommande(data) {
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

    return {
      success: true,
    };
  }
}

module.exports = DriveAPI;
