# Requirements Document

## Introduction

Cette fonctionnalité permet aux organisateurs de mariage de générer des QR codes contenant les informations des invités et de les partager directement via WhatsApp sous forme d'images. L'objectif est de simplifier le processus d'envoi des invitations numériques en permettant le partage d'images QR code de haute qualité plutôt que de simples données textuelles.

## Glossary

- **QR Code System**: Le système de génération et de partage de QR codes pour les invitations de mariage
- **Guest Database**: La base de données SQLite contenant les informations des invités (nom, table, accompagnants)
- **Image Capture Module**: Le composant responsable de la conversion du QR code en image
- **WhatsApp Share Module**: Le module gérant l'intégration avec WhatsApp pour le partage
- **Media Library**: La galerie de photos du téléphone où les QR codes peuvent être sauvegardés
- **Invitation Message**: Le message personnalisé accompagnant le QR code lors du partage

## Requirements

### Requirement 1

**User Story:** En tant qu'organisateur de mariage, je veux générer une image QR code contenant les informations d'un invité, afin de pouvoir la partager facilement via WhatsApp.

#### Acceptance Criteria

1. WHEN THE organisateur sélectionne un invité, THE QR Code System SHALL générer un QR code visuel contenant l'ID, le nom complet, la table assignée et le nombre d'accompagnants de l'invité
2. THE QR Code System SHALL afficher le QR code avec une taille minimale de 200x200 pixels pour assurer la lisibilité lors du scan
3. THE QR Code System SHALL inclure le nom de l'invité comme étiquette visible sous le QR code
4. THE QR Code System SHALL encoder les données au format JSON avec un type "wedding_invitation" et un timestamp de génération

### Requirement 2

**User Story:** En tant qu'organisateur de mariage, je veux capturer le QR code comme une image, afin de pouvoir le sauvegarder et le partager.

#### Acceptance Criteria

1. WHEN THE organisateur demande de capturer le QR code, THE Image Capture Module SHALL convertir le composant QR code en image PNG
2. THE Image Capture Module SHALL générer une image avec une résolution minimale de 400x400 pixels
3. THE Image Capture Module SHALL inclure un fond blanc et le QR code en noir pour maximiser le contraste
4. IF THE capture échoue, THEN THE QR Code System SHALL afficher un message d'erreur explicite à l'organisateur

### Requirement 3

**User Story:** En tant qu'organisateur de mariage, je veux sauvegarder l'image QR code dans la galerie de mon téléphone, afin de pouvoir y accéder ultérieurement.

#### Acceptance Criteria

1. WHEN THE organisateur demande de sauvegarder le QR code, THE QR Code System SHALL demander les permissions d'accès à la Media Library
2. IF THE permissions sont accordées, THEN THE QR Code System SHALL sauvegarder l'image dans l'album photos par défaut
3. THE QR Code System SHALL nommer le fichier selon le format "QR_[NomInvite]_[Timestamp].png"
4. WHEN THE sauvegarde est réussie, THE QR Code System SHALL afficher une notification de confirmation à l'organisateur
5. IF THE sauvegarde échoue, THEN THE QR Code System SHALL afficher un message d'erreur avec la raison de l'échec

### Requirement 4

**User Story:** En tant qu'organisateur de mariage, je veux partager l'image QR code directement via WhatsApp avec un message personnalisé, afin d'envoyer l'invitation complète à l'invité.

#### Acceptance Criteria

1. WHEN THE organisateur demande de partager via WhatsApp, THE WhatsApp Share Module SHALL vérifier si WhatsApp est installé sur l'appareil
2. IF WhatsApp est installé, THEN THE WhatsApp Share Module SHALL ouvrir WhatsApp avec l'image QR code prête à être partagée
3. THE WhatsApp Share Module SHALL générer un Invitation Message contenant le nom de l'invité, la table assignée, le nombre d'accompagnants et les instructions d'utilisation
4. THE WhatsApp Share Module SHALL permettre à l'organisateur de sélectionner le contact destinataire dans WhatsApp
5. IF WhatsApp n'est pas installé, THEN THE QR Code System SHALL proposer le partage via le menu de partage natif du système

### Requirement 5

**User Story:** En tant qu'organisateur de mariage, je veux naviguer facilement entre les invités pour partager leurs QR codes, afin de traiter plusieurs invitations rapidement.

#### Acceptance Criteria

1. THE QR Code System SHALL afficher un compteur indiquant la position actuelle et le nombre total d'invités (format "X / Y")
2. THE QR Code System SHALL fournir des boutons "Précédent" et "Suivant" pour naviguer entre les invités
3. WHEN THE organisateur est sur le premier invité, THE QR Code System SHALL désactiver le bouton "Précédent"
4. WHEN THE organisateur est sur le dernier invité, THE QR Code System SHALL désactiver le bouton "Suivant"
5. WHEN THE organisateur change d'invité, THE QR Code System SHALL régénérer le QR code dans un délai maximal de 500 millisecondes

### Requirement 6

**User Story:** En tant qu'organisateur de mariage, je veux voir un aperçu des informations de l'invité avant de partager, afin de vérifier que les données sont correctes.

#### Acceptance Criteria

1. THE QR Code System SHALL afficher le nom complet de l'invité au-dessus du QR code
2. THE QR Code System SHALL afficher la table assignée avec une icône de localisation
3. THE QR Code System SHALL afficher le nombre d'accompagnants avec une icône de groupe
4. THE QR Code System SHALL utiliser une mise en page claire et lisible avec une hiérarchie visuelle appropriée

### Requirement 7

**User Story:** En tant qu'organisateur de mariage, je veux être informé si aucun invité n'est disponible, afin de savoir que je dois d'abord ajouter des invités.

#### Acceptance Criteria

1. WHEN THE Guest Database ne contient aucun invité, THE QR Code System SHALL afficher un message "Aucun invité trouvé"
2. THE QR Code System SHALL afficher un message d'aide indiquant comment ajouter des invités
3. THE QR Code System SHALL désactiver tous les boutons de partage et de navigation
4. WHEN THE organisateur ajoute un invité, THE QR Code System SHALL automatiquement rafraîchir la liste lors du retour à l'écran

### Requirement 8

**User Story:** En tant qu'organisateur de mariage, je veux que le message WhatsApp soit personnalisé et professionnel, afin que l'invité reçoive une invitation claire et élégante.

#### Acceptance Criteria

1. THE Invitation Message SHALL commencer par un titre "🎉 Invitation de mariage - [Nom]"
2. THE Invitation Message SHALL inclure une salutation personnalisée avec le nom de l'invité
3. THE Invitation Message SHALL lister les détails de l'invitation (table, accompagnants)
4. THE Invitation Message SHALL inclure des instructions claires sur l'utilisation du QR code le jour J
5. THE Invitation Message SHALL se terminer par une formule de politesse chaleureuse
