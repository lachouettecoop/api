# L'API de La Chouette Coop

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**PROTOTYPE** Cette application est encore au stade d'expérimentation, avant de
pouvoir être proposée sérieusement à des groupes.

Cette application vise à exposer en un seul endroit l'ensemble des données de
La Chouette Coop. Elle permet un accès homogène à des données issues de diverses
applications / fichiers, ouvrant la possibilité à des croisements de données et
à la construction d'applications spécifiques rapidement.

De manière plus technique, c'est une API GraphQL permettant d'accéder aux données
suivantes :

- Authentification via le LDAP
- Annuaire des coopérateurs et coopératrices de la SAS
- Planning du Lab

## Documentation

Pas encore `¯\_(ツ)_/¯`

## Présentation

Pas encore `¯\_(ツ)_/¯`

## Installation

- `npm install`
- créer un fichier `.env` avec les accès aux services tiers (exemple de fichier
  disponible dans `.env.dist`)

## Lancement

- En mode développeur : `npm run dev`
- En production : `npm run start`

## Tests

Les tests automatisés se lancent avec la commande : `npm run test`

## Contribution

Nous suivons la convention https://www.conventionalcommits.org/ pour les
messages de commits, afin de permettre une publication simple des nouvelles
versions et des changelogs. Nous pensons que cela facilite le suivi du projet et
sa maintenance/reprise sur le long terme.

**Cela n’est pas très compliqué !** Au lieu de faire `git commit`, exécutez
`npm run commit` et laissez-vous guider !

## Release

- `GITHUB_TOKEN="xxxxxx" npm run release`

Vous pouvez ajouter le suffixe `-- -n` à la commande pour une release
entièrement automatisée, si vous osez !

## Déploiement

Pas encore `¯\_(ツ)_/¯`
