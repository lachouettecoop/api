const { gql } = require("apollo-server");

const typeDefs = gql`
  type Chouettos {
    nom: String
    prenom: String
    email: String
  }

  extend type Query {
    "L'utilisateur actuellement connecté"
    moi: Chouettos
  }
`;

const resolvers = {
  Query: {
    moi: () => ({
      nom: "MARTIN",
      prenom: "Pierre",
      email: "contact@example.com"
    })
  }
};

module.exports = {
  typeDefs,
  resolvers
};
