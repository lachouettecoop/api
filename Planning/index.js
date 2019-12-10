const { gql } = require("apollo-server");
const PlanningAPI = require("./PlanningAPI");
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require("graphql-iso-date");
const startOfMonth = require("date-fns/startOfMonth");
const endOfMonth = require("date-fns/endOfMonth");

const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime

  extend type Query {
    "Le planning du Lab sur une période donnée"
    planning(debut: Date, fin: Date): [Jour]
    "Le planning du Lab pour une journée donnée"
    planningDuJour(date: Date!): Jour
  }

  interface Jour {
    date: Date!
    labOuvert: Boolean!
  }

  type JourFermeture implements Jour {
    date: Date!
    labOuvert: Boolean!
  }
  type JourOuverture implements Jour {
    date: Date!
    labOuvert: Boolean!

    creneaux: [Creneau]
  }

  type Creneau {
    nom: String!
    postes: [Poste]
  }

  type Poste {
    nom: String!
    date: Date!
    horaires: Horaires
    piaffeur: Piaffeur
    notes: String
  }

  type Horaires {
    debut: DateTime!
    fin: DateTime!
  }

  type Piaffeur {
    nom: String
    prenom: String
    "Champ à utiliser pour afficher l'identité d'une personne"
    nomAffichage: String
    telephone: String
    email: String
  }
`;

const resolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,

  Query: {
    planning: async (
      _,
      { debut = startOfMonth(new Date()), fin = endOfMonth(new Date()) },
      { dataSources }
    ) => dataSources.planningAPI.getPeriode(debut, fin),
    planningDuJour: async (_, { date }, { dataSources }) =>
      dataSources.planningAPI.getJour(date)
  },

  Jour: {
    __resolveType: jour => (jour.isOpened() ? "JourOuverture" : "JourFermeture")
  },
  JourFermeture: {
    date: jour => jour.getDate(),
    labOuvert: () => false
  },
  JourOuverture: {
    date: jour => jour.getDate(),
    labOuvert: () => true,
    creneaux: jour => jour.tasks
  },

  Creneau: {
    nom: ({ label }) => label,
    postes: ({ slots }) => slots
  },

  Poste: {
    nom: ({ label }) => label,
    piaffeur: ({ person }) => person
  },

  Piaffeur: {
    nom: ({ lastName }) => lastName,
    prenom: ({ firstName }) => firstName,
    nomAffichage: ({ lastName, firstName }) =>
      firstName ? `${firstName} ${lastName}` : null
  }
};

module.exports = {
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      planningAPI: new PlanningAPI(process.env.PLANNING_CSV_URL)
    };
  }
};
