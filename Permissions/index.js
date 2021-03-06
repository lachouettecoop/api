const { rule, shield, and, or, not, allow, deny } = require("graphql-shield");

const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    return ctx.user !== null;
  }
);

const permissions = {
  Query: {
    version: allow
  },
  Mutation: {
    ping: allow,
    loginChouettos: not(isAuthenticated),
    passerCommande: allow
  },
  LoginChouettosPayload: {
    "*": not(isAuthenticated)
  },
  PasserCommandePayload: {
    "*": allow
  }
};

const middleware = shield(permissions, { fallbackRule: isAuthenticated });

module.exports = {
  middleware
};
