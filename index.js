require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const { makeExecutableSchema } = require("graphql-tools");
const { applyMiddleware } = require("graphql-middleware");
const merge = require("lodash/merge");

const { decode } = require("./Authentification/jwtUserToken");
const Permissions = require("./Permissions");

const Annuaire = require("./Annuaire");
const Authentification = require("./Authentification");
const Planning = require("./Planning");

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

    "Réponse recommandée pour une mutation"
    interface MutationResponse {
      success: Boolean!
      code: String
      message: String
    }
  `,
  resolvers: {
    Query: {
      version: () => process.env.npm_package_version
    },
    Mutation: {
      ping: () => "pong"
    },
    MutationResponse: {
      __resolveType: () => null // see https://github.com/apollographql/apollo-server/issues/1075#issuecomment-427476421
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs: [
    App.typeDefs,
    Annuaire.typeDefs,
    Authentification.typeDefs,
    Planning.typeDefs
  ],
  resolvers: merge(
    App.resolvers,
    Annuaire.resolvers,
    Authentification.resolvers,
    Planning.resolvers
  )
});

const server = new ApolloServer({
  schema: applyMiddleware(schema, Permissions.middleware),
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    const user = token ? decode(token).data : null;

    return {
      user
    };
  },
  dataSources: () => merge(Annuaire.dataSources(), Planning.dataSources())
});

server.listen().then(({ url }) => {
  console.log(`-> Serveur démarré : ${url}`);
});
