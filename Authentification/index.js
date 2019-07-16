const { gql } = require("apollo-server");
const authenticate = require("./authenticate");
const jwtUserToken = require("./jwtUserToken");

const typeDefs = gql`
  type Chouettos {
    lastname: String
    firstname: String
    displayName: String
    barcode: String
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
    chouettos: Chouettos
  }

  extend type Query {
    "L'utilisateur actuellement connecté"
    me: Chouettos
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
        const chouettos = jwtUserToken.decode(token).data;

        return {
          success: true,
          token,
          chouettos
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
