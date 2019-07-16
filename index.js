const { ApolloServer, gql } = require("apollo-server");
const { makeExecutableSchema } = require("graphql-tools");
const merge = require("lodash/merge");

const Authentification = require("./Authentification");
const App = {
  typeDefs: gql`
    type Query {
      "Version actuelle du code de l'API"
      version: String
    }

    type Mutation {
      "Permet de s'assurer du bon fonctionnement du serveur"
      ping: String
    }
  `,
  resolvers: {
    Query: {
      version: () => process.env.npm_package_version
    },
    Mutation: {
      ping: () => "pong"
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs: [App.typeDefs, Authentification.typeDefs],
  resolvers: merge(App.resolvers, Authentification.resolvers)
});
const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`-> Serveur démarré : ${url}`);
});
