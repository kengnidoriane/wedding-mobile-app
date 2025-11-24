export interface GuestQRData {
  id: string;
  fullName: string;
  tableName: string;
  companions: number;
}

export const generateQRData = (guest: any): string => {
  const qrData: GuestQRData = {
    id: guest.id,
    fullName: guest.fullName,
    tableName: guest.tableName,
    companions: guest.companions
  };
  // Ajouter un timestamp pour l'unicité
  const qrWithMeta = {
    ...qrData,
    generated: new Date().toISOString(),
    type: 'wedding_invitation'
  };
  return JSON.stringify(qrWithMeta);
};

export const parseQRData = (qrString: string): GuestQRData | null => {
  try {
    const data = JSON.parse(qrString);
    
    // Vérifier que toutes les propriétés requises sont présentes
    if (
      typeof data.id === 'string' &&
      typeof data.fullName === 'string' &&
      typeof data.tableName === 'string' &&
      typeof data.companions === 'number'
    ) {
      return data as GuestQRData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const generateWhatsAppMessage = (guest: GuestQRData): string => {
  return `🎉 Invitation de mariage - ${guest.fullName}

Bonjour ${guest.fullName},

Voici votre QR code d'invitation personnalisé :

📋 Détails de votre invitation :
• Nom : ${guest.fullName}
• Table assignée : ${guest.tableName}
• Nombre d'accompagnants : ${guest.companions}
• ID invité : ${guest.id}

📱 Instructions :
1. Gardez ce QR code sur votre téléphone
2. Présentez-le à l'entrée le jour J
3. Notre équipe le scannera pour confirmer votre présence

Merci et à très bientôt ! 💒✨`;
};

export const generateWhatsAppShareMessage = (guest: GuestQRData): string => {
  return `🎉 *Invitation de mariage - ${guest.fullName}*

Bonjour ${guest.fullName} !

Voici votre QR code d'invitation personnalisé 📱

*Détails de votre invitation :*
📍 Table : ${guest.tableName}
👥 Accompagnants : ${guest.companions}
🆔 ID : ${guest.id}

*Instructions :*
1️⃣ Sauvegardez cette image sur votre téléphone
2️⃣ Présentez-la à l'entrée le jour J
3️⃣ Notre équipe la scannera pour confirmer votre présence

Merci et à très bientôt ! 💒✨`;
};

export const generateBulkWhatsAppMessage = (guests: GuestQRData[]): string => {
  let message = '🎉 INVITATIONS DE MARIAGE - LISTE COMPLÈTE 🎉\n\n';
  message += `📊 Résumé : ${guests.length} invité(s) au total\n\n`;
  message += '👥 Liste des invités :\n\n';

  guests.forEach((guest, index) => {
    message += `${index + 1}. 👤 ${guest.fullName}\n`;
    message += `   📍 Table : ${guest.tableName}\n`;
    message += `   👥 Accompagnants : ${guest.companions}\n`;
    message += `   🆔 ID : ${guest.id}\n\n`;
  });

  message += '📋 Instructions importantes :\n';
  message += '• Chaque invité doit recevoir son QR code individuel\n';
  message += '• Les QR codes contiennent les informations personnalisées\n';
  message += '• À présenter obligatoirement le jour de la cérémonie\n';
  message += '• Notre équipe scannera pour validation\n\n';
  message += '💒 Merci et à bientôt ! ✨';

  return message;
};