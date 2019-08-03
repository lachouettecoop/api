const { gql } = require("apollo-server");
const CooperateursAPI = require("./CooperateursAPI");

const typeDefs = gql`
  type Chouettos {
    lastname: String
    firstname: String
    displayName: String
  }

  extend type Query {
    "Les coopérateurs et coopératrices de la SAS (ayant souscrit des parts sociales)"
    allCooperateurs: [Chouettos]
  }
`;

const resolvers = {
  Query: {
    allCooperateurs: (_, __, { dataSources }) =>
      dataSources.cooperateursAPI.getAll()
  },
  Chouettos: {
    displayName: ({ lastname, firstname }) => `${firstname} ${lastname}`
  }
};

module.exports = {
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      cooperateursAPI: new CooperateursAPI(
        process.env.ANNUAIRE_COOPERATEURS_CSV_URL
      )
    };
  }
};
