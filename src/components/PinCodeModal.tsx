import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button';

interface PinCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
}

export const PinCodeModal: React.FC<PinCodeModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title = '🔐 Code Administrateur',
  message = 'Entrez le code à 4 chiffres'
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null)
  ];

  useEffect(() => {
    if (visible) {
      // Reset et focus sur le premier champ
      setPin(['', '', '', '']);
      setError('');
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [visible]);

  const handlePinChange = (value: string, index: number) => {
    // Accepter seulement les chiffres
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus sur le champ suivant
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Vérifier si le code est complet
    if (index === 3 && value) {
      const fullPin = newPin.join('');
      handleSubmit(fullPin);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Retour arrière
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (fullPin: string) => {
    const { adminAuthService } = await import('../services/adminAuthService');
    
    const isValid = await adminAuthService.verifyPin(fullPin);
    
    if (isValid) {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('❌ Code incorrect');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleManualSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      handleSubmit(fullPin);
    } else {
      setError('⚠️ Veuillez entrer les 4 chiffres');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.pinInput,
                  digit && styles.pinInputFilled,
                  error && styles.pinInputError
                ]}
                value={digit}
                onChangeText={(value) => handlePinChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                secureTextEntry
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              title="Annuler"
              onPress={onClose}
              variant="outline"
              size="md"
            />
            <Button
              title="Valider"
              onPress={handleManualSubmit}
              variant="primary"
              size="md"
            />
          </View>

          <Text style={styles.hint}>
            💡 Code par défaut : 1234
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  pinInput: {
    width: 56,
    height: 64,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: theme.borderRadius.md,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
    backgroundColor: '#F2F2F7',
  },
  pinInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  pinInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
    marginTop: theme.spacing.md,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
