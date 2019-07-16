const LdapAuth = require("ldapauth-fork");

const ldap = new LdapAuth({
  url: process.env.LDAP_SERVER,
  bindDN: process.env.LDAP_USER,
  bindCredentials: process.env.LDAP_PASS,
  searchBase: "dc=lachouettecoop,dc=fr",
  searchFilter: "(cn={{username}})",
  reconnect: true,
  timeout: 5000,
  connectTimeout: 5000
});

const authenticate = (email, password) =>
  new Promise((resolve, reject) => {
    ldap.authenticate(email, password, (err, user) => {
      err ? reject(err) : resolve(user);
    });
  });

module.exports = authenticate;
