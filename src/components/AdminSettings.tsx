/**
 * Composant pour les paramètres administrateur
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { authService } from '../services/authService';
import { theme } from '../styles/theme';
import Card from './Card';
import Button from './Button';

interface AdminSettingsProps {
  onClose: () => void;
}

export default function AdminSettings({ onClose }: AdminSettingsProps) {
  const [loading, setLoading] = useState(false);

  const handleChangePin = async () => {
    Alert.prompt(
      'PIN Actuel',
      'Entrez votre PIN actuel :',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Suivant',
          onPress: (currentPin) => {
            if (!currentPin) return;
            
            Alert.prompt(
              'Nouveau PIN',
              'Entrez votre nouveau PIN (min. 4 chiffres) :',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Confirmer',
                  onPress: async (newPin) => {
                    if (!newPin) return;
                    
                    try {
                      setLoading(true);
                      const success = await authService.changePin(currentPin, newPin);
                      
                      if (success) {
                        Alert.alert('Succès', 'PIN modifié avec succès');
                        onClose();
                      } else {
                        Alert.alert('Erreur', 'PIN actuel incorrect');
                      }
                    } catch (error: any) {
                      Alert.alert('Erreur', error.message || 'Erreur lors du changement de PIN');
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ],
              'secure-text'
            );
          }
        }
      ],
      'secure-text'
    );
  };

  const handleLogout = () => {
    authService.logout();
    Alert.alert('Déconnexion', 'Vous avez été déconnecté');
    onClose();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Paramètres Admin</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <Text style={styles.description}>
            PIN par défaut : 1234{'\n'}
            Changez-le pour sécuriser votre application
          </Text>
          
          <Button
            title="Changer le PIN"
            onPress={handleChangePin}
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.description}>
            Votre session admin expire après 30 minutes d'inactivité
          </Text>
          
          <Button
            title="Se déconnecter"
            onPress={handleLogout}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <Button
          title="Fermer"
          onPress={onClose}
          variant="outline"
          style={styles.closeButton}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
  },
});