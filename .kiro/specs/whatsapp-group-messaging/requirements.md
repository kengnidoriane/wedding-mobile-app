# Requirements Document

## Introduction

Cette fonctionnalité étend le système existant de partage QR codes en ajoutant la capacité d'envoyer des messages WhatsApp groupés avec des messages personnalisables. L'objectif est de permettre aux organisateurs de mariage d'envoyer des invitations QR code à plusieurs invités simultanément avec un message personnalisé, tout en conservant la possibilité d'utiliser un message par défaut professionnel.

## Glossary

- **WhatsApp Group Messaging System**: Le système d'envoi de messages WhatsApp en lot avec QR codes
- **Guest Database**: La base de données Firebase Firestore contenant les informations des invités incluant les numéros de téléphone
- **Phone Number Field**: Le champ numéro de téléphone ajouté à la table des invités
- **Message Template System**: Le système de gestion des messages personnalisables avec variables dynamiques
- **Batch Messaging Module**: Le module responsable de l'envoi groupé de messages WhatsApp
- **Message Composer**: L'interface de composition et personnalisation des messages
- **Default Message Template**: Le modèle de message par défaut avec variables substituables

## Requirements

### Requirement 1

**User Story:** En tant qu'organisateur de mariage, je veux ajouter des numéros de téléphone aux profils des invités, afin de pouvoir leur envoyer des messages WhatsApp directement.

#### Acceptance Criteria

1. THE Guest Database SHALL inclure un nouveau champ "phoneNumber" de type string dans la collection Firestore des invités
2. WHEN THE organisateur ajoute ou modifie un invité, THE WhatsApp Group Messaging System SHALL permettre la saisie d'un numéro de téléphone au format international
3. THE WhatsApp Group Messaging System SHALL valider le format du numéro de téléphone selon le pattern international (+33, +1, etc.)
4. THE WhatsApp Group Messaging System SHALL permettre de laisser le champ numéro vide (optionnel)
5. WHEN THE organisateur importe des invités via CSV, THE WhatsApp Group Messaging System SHALL supporter une colonne "phoneNumber" optionnelle

### Requirement 2

**User Story:** En tant qu'organisateur de mariage, je veux composer un message personnalisé pour accompagner les QR codes, afin d'adapter le ton et le contenu selon l'événement.

#### Acceptance Criteria

1. THE Message Composer SHALL afficher une zone de texte multiligne pour la saisie du message personnalisé
2. THE Message Composer SHALL pré-remplir la zone avec le Default Message Template contenant des variables substituables
3. THE Default Message Template SHALL inclure les variables ${nom-de-l-invite}, ${table}, ${accompagnants} et ${date-evenement}
4. THE Message Composer SHALL afficher un aperçu du message avec les variables remplacées par des exemples
5. THE Message Composer SHALL permettre de restaurer le message par défaut via un bouton "Réinitialiser"

### Requirement 3

**User Story:** En tant qu'organisateur de mariage, je veux définir un message par défaut professionnel, afin d'avoir une base de travail cohérente pour tous les envois.

#### Acceptance Criteria

1. THE Default Message Template SHALL commencer par "${nom-de-l-invite}, ce QR code tient lieu d'invitation pour le mariage"
2. THE Default Message Template SHALL inclure les instructions "veuillez présenter cela à l'entrée de la salle"
3. THE Default Message Template SHALL inclure les détails de l'invitation (table, accompagnants)
4. THE Default Message Template SHALL se terminer par une formule de politesse chaleureuse
5. THE Default Message Template SHALL être modifiable dans les paramètres de l'application

### Requirement 4

**User Story:** En tant qu'organisateur de mariage, je veux sélectionner plusieurs invités pour l'envoi groupé, afin de traiter efficacement les invitations multiples.

#### Acceptance Criteria

1. THE WhatsApp Group Messaging System SHALL afficher une liste de tous les invités avec des cases à cocher
2. THE WhatsApp Group Messaging System SHALL filtrer automatiquement les invités ayant un numéro de téléphone valide
3. THE WhatsApp Group Messaging System SHALL permettre de sélectionner/désélectionner tous les invités via un bouton "Tout sélectionner"
4. THE WhatsApp Group Messaging System SHALL afficher le nombre d'invités sélectionnés en temps réel
5. THE WhatsApp Group Messaging System SHALL désactiver l'envoi si aucun invité n'est sélectionné

### Requirement 5

**User Story:** En tant qu'organisateur de mariage, je veux envoyer des messages WhatsApp groupés avec les QR codes personnalisés, afin de distribuer toutes les invitations rapidement.

#### Acceptance Criteria

1. WHEN THE organisateur lance l'envoi groupé, THE Batch Messaging Module SHALL générer un QR code unique pour chaque invité sélectionné
2. THE Batch Messaging Module SHALL personnaliser le message pour chaque invité en substituant les variables par leurs données réelles
3. THE Batch Messaging Module SHALL ouvrir WhatsApp avec le message et l'image QR code pré-remplis pour chaque invité séquentiellement
4. THE Batch Messaging Module SHALL permettre à l'organisateur de confirmer ou ignorer chaque envoi individuellement
5. THE Batch Messaging Module SHALL maintenir un compteur de progression "X / Y envois"

### Requirement 6

**User Story:** En tant qu'organisateur de mariage, je veux voir un aperçu du message avant l'envoi groupé, afin de vérifier que le contenu est correct.

#### Acceptance Criteria

1. THE Message Composer SHALL afficher un aperçu en temps réel du message avec un exemple d'invité
2. THE Message Composer SHALL mettre en évidence les variables substituées avec une couleur différente
3. THE Message Composer SHALL afficher la longueur du message et avertir si trop long (>1000 caractères)
4. THE Message Composer SHALL permettre de tester l'aperçu avec différents invités via un sélecteur
5. THE Message Composer SHALL afficher un aperçu du QR code qui sera joint au message

### Requirement 7

**User Story:** En tant qu'organisateur de mariage, je veux gérer les erreurs d'envoi gracieusement, afin de pouvoir reprendre les envois échoués.

#### Acceptance Criteria

1. WHEN THE un envoi échoue, THE Batch Messaging Module SHALL marquer l'invité comme "échec" et continuer avec le suivant
2. THE Batch Messaging Module SHALL afficher un résumé final avec le nombre d'envois réussis et échoués
3. THE Batch Messaging Module SHALL permettre de relancer uniquement les envois échoués
4. THE Batch Messaging Module SHALL logger les erreurs avec les détails pour le debugging
5. IF WhatsApp n'est pas installé, THEN THE Batch Messaging Module SHALL proposer le partage via le menu natif

### Requirement 8

**User Story:** En tant qu'organisateur de mariage, je veux sauvegarder mes messages personnalisés, afin de les réutiliser pour d'autres événements.

#### Acceptance Criteria

1. THE Message Template System SHALL permettre de sauvegarder le message actuel comme modèle personnalisé
2. THE Message Template System SHALL afficher une liste des modèles sauvegardés avec nom et date de création
3. THE Message Template System SHALL permettre de charger un modèle sauvegardé dans le compositeur
4. THE Message Template System SHALL permettre de supprimer les modèles personnalisés
5. THE Message Template System SHALL limiter à 10 modèles personnalisés maximum

### Requirement 9

**User Story:** En tant qu'organisateur de mariage, je veux filtrer les invités par statut de téléphone, afin de voir facilement qui peut recevoir des messages WhatsApp.

#### Acceptance Criteria

1. THE WhatsApp Group Messaging System SHALL afficher des onglets "Tous", "Avec téléphone", "Sans téléphone"
2. THE WhatsApp Group Messaging System SHALL afficher un badge avec le nombre d'invités dans chaque catégorie
3. THE WhatsApp Group Messaging System SHALL permettre de basculer entre les vues sans perdre les sélections
4. THE WhatsApp Group Messaging System SHALL mettre en évidence visuellement les invités sans numéro de téléphone
5. THE WhatsApp Group Messaging System SHALL permettre d'ajouter rapidement un numéro depuis la liste

### Requirement 10

**User Story:** En tant qu'organisateur de mariage, je veux suivre l'historique des envois, afin de savoir qui a déjà reçu son invitation.

#### Acceptance Criteria

1. THE WhatsApp Group Messaging System SHALL créer une collection Firestore "message_history" pour tracer les envois
2. THE WhatsApp Group Messaging System SHALL enregistrer la date, l'ID invité, le statut (envoyé/échoué) et le message envoyé dans Firestore pour chaque message
3. THE WhatsApp Group Messaging System SHALL afficher un indicateur visuel sur chaque invité (✅ envoyé, ❌ échoué, ⏳ en attente)
4. THE WhatsApp Group Messaging System SHALL permettre de voir les détails de l'historique d'envoi par invité
5. THE WhatsApp Group Messaging System SHALL permettre de filtrer les invités par statut d'envoi

### Requirement 11

**User Story:** En tant qu'organisateur de mariage, je veux que les données soient synchronisées en temps réel avec Firebase, afin que plusieurs organisateurs puissent collaborer simultanément.

#### Acceptance Criteria

1. THE WhatsApp Group Messaging System SHALL synchroniser automatiquement les modifications de numéros de téléphone avec Firebase Firestore
2. THE WhatsApp Group Messaging System SHALL écouter les changements en temps réel des données invités via les listeners Firestore
3. THE WhatsApp Group Messaging System SHALL mettre à jour l'interface utilisateur automatiquement quand les données changent
4. THE WhatsApp Group Messaging System SHALL gérer les conflits de modification simultanée avec un système de timestamps
5. THE WhatsApp Group Messaging System SHALL fonctionner en mode hors ligne avec synchronisation automatique au retour de connexion

### Requirement 12

**User Story:** En tant qu'organisateur de mariage, je veux que l'historique des messages soit partagé entre tous les organisateurs, afin d'éviter les doublons d'envoi.

#### Acceptance Criteria

1. THE WhatsApp Group Messaging System SHALL stocker l'historique des messages dans une collection Firestore partagée
2. THE WhatsApp Group Messaging System SHALL inclure l'ID de l'organisateur qui a envoyé chaque message
3. THE WhatsApp Group Messaging System SHALL afficher qui a envoyé chaque message et quand
4. THE WhatsApp Group Messaging System SHALL empêcher l'envoi multiple du même message à un invité le même jour
5. THE WhatsApp Group Messaging System SHALL permettre de voir l'activité de tous les organisateurs en temps réel