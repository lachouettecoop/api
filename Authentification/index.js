const { gql } = require("apollo-server");
const authenticate = require("./authenticate");
const jwtUserToken = require("./jwtUserToken");

const typeDefs = gql`
  type User {
    nom: String
    prenom: String
    "Champ à utiliser pour afficher l'identité d'une personne"
    nomAffichage: String
    codeBarre: String
    email: String
  }

  input LoginChouettosInput {
    email: String
    password: String
  }
  type LoginChouettosPayload implements MutationResponse {
    success: Boolean!
    code: String
    message: String

    token: String
  }

  extend type Query {
    "L'utilisateur actuellement connecté"
    me: User
  }

  extend type Mutation {
    loginChouettos(input: LoginChouettosInput!): LoginChouettosPayload
  }
`;

const resolvers = {
  Query: {
    me: (_, __, { user }) => user
  },
  Mutation: {
    loginChouettos: async (_, { input: { email, password } }) => {
      try {
        const user = await authenticate(email, password);
        const token = jwtUserToken.createFromData(user);

        return {
          success: true,
          token
        };
      } catch (err) {
        const code = err.message
          ? "IDENTIFIANTS_INCORRECTS"
          : "EMAIL_INTROUVABLE";

        return {
          success: false,
          code,
          message: err.message ? err.message : err
        };
      }
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};
