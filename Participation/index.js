const { gql } = require("apollo-server");
const SuiviParticipationAPI = require("./SuiviParticipationAPI");

const typeDefs = gql`
  extend type Chouettos {
    participation: Participation
  }

  type Participation {
    dateDernierePIAF: Date
    dateProchainePIAF: Date

    nombrePIAFOk: Boolean
    nombrePIAFDepuis2018: Int
    nombrePIAFAttendus: Int
  }

  extend type Query {
    statsParticipation: StatsParticipation
  }

  type StatsParticipation {
    nombreAJourDePIAF: Int
    nombreNonAJourDePIAF: Int
  }
`;

const resolvers = {
  Query: {
    statsParticipation: async (_, __, { dataSources }) => {
      const aJour = await dataSources.SuiviParticipationAPI.getAllOk();
      const nonAJour = await dataSources.SuiviParticipationAPI.getAllNonOk();

      return {
        nombreAJourDePIAF: aJour.length,
        nombreNonAJourDePIAF: nonAJour.length
      };
    }
  },
  Chouettos: {
    participation: ({ email }, _, { dataSources }) =>
      dataSources.SuiviParticipationAPI.getByEmail(email)
  }
};

module.exports = {
  typeDefs,
  resolvers,
  dataSources: () => {
    const googleSheetsCredentials = {
      type: process.env.GOOGLE_SHEETS_TYPE,
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
      auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
      token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_X509_CERT_URL
    };

    return {
      SuiviParticipationAPI: new SuiviParticipationAPI(
        googleSheetsCredentials,
        process.env.PARTICIPATION_SHEET_ID,
        process.env.PARTICIPATION_SHEET_TITLE
      )
    };
  }
};
