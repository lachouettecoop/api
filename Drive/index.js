const { gql } = require("apollo-server");
const DriveAPI = require("./DriveAPI");

const typeDefs = gql`
  extend type Mutation {
    "Passe une commande au drive"
    passerCommande(input: PasserCommandeInput!): PasserCommandePayload
  }

  input PasserCommandeInput {
    nom: String!
    email: String!
    telephone: String!
    codeCommande: String!
    notes: String
  }

  type PasserCommandePayload {
    success: Boolean
  }
`;

const resolvers = {
  Mutation: {
    passerCommande: (_, { input }, { dataSources }) =>
      dataSources.DriveAPI.passerCommande(input)
  }
};

module.exports = {
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      DriveAPI: new DriveAPI(
        process.env.DRIVE_EMAIL,
        process.env.DRIVE_SMTP_DSN
      )
    };
  }
};
