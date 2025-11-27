import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button';
import { LoadingButton } from './LoadingButton';
import { ExportOptions } from '../services/pdfExportService';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  loading: boolean;
  guestCount: number;
  presentCount: number;
}

const ExportModal = memo<ExportModalProps>(function ExportModal({
  visible,
  onClose,
  onExport,
  loading,
  guestCount,
  presentCount
}) {
  const [options, setOptions] = useState<ExportOptions>({
    includeQRCodes: false,
    onlyPresent: false,
    groupByTable: true,
    includeCompanions: true
  });

  const handleExport = async () => {
    await onExport(options);
  };

  const OptionRow = ({ 
    title, 
    description, 
    value, 
    onValueChange,
    disabled = false 
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.optionRow, disabled && styles.optionRowDisabled]}>
      <View style={styles.optionInfo}>
        <Text style={[styles.optionTitle, disabled && styles.optionTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.optionDescription, disabled && styles.optionDescriptionDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const estimatedCount = options.onlyPresent ? presentCount : guestCount;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Exporter en PDF</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>📄 Aperçu</Text>
              <Text style={styles.previewText}>
                {estimatedCount} invité{estimatedCount > 1 ? 's' : ''} • 
                {options.groupByTable ? ' Groupés par table' : ' Liste simple'} • 
                {options.includeCompanions ? ' Avec accompagnants' : ' Sans accompagnants'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contenu</Text>
              
              <OptionRow
                title="Invités présents uniquement"
                description={`${presentCount} invités présents sur ${guestCount} total`}
                value={options.onlyPresent}
                onValueChange={(value) => setOptions(prev => ({ ...prev, onlyPresent: value }))}
              />

              <OptionRow
                title="Inclure les accompagnants"
                description="Afficher le nombre d'accompagnants pour chaque invité"
                value={options.includeCompanions}
                onValueChange={(value) => setOptions(prev => ({ ...prev, includeCompanions: value }))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organisation</Text>
              
              <OptionRow
                title="Grouper par table"
                description="Organiser la liste par numéro de table"
                value={options.groupByTable}
                onValueChange={(value) => setOptions(prev => ({ ...prev, groupByTable: value }))}
              />

              <OptionRow
                title="Inclure les QR codes"
                description="Ajouter une zone pour les QR codes (à venir)"
                value={options.includeQRCodes}
                onValueChange={(value) => setOptions(prev => ({ ...prev, includeQRCodes: value }))}
                disabled={true}
              />
            </View>

            <View style={styles.info}>
              <Text style={styles.infoText}>
                💡 Le PDF sera généré avec un design professionnel incluant les statistiques et la date d'export.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <LoadingButton
              title={`Générer le PDF (${estimatedCount} invités)`}
              onPress={handleExport}
              variant="primary"
              size="lg"
              loading={loading}
              icon="📄"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  placeholder: {
    width: 60, // Same width as cancel button for centering
  },
  content: {
    paddingHorizontal: 16,
  },
  preview: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  optionRowDisabled: {
    opacity: 0.5,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  optionTitleDisabled: {
    color: '#999999',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  optionDescriptionDisabled: {
    color: '#CCCCCC',
  },
  info: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
});

export default ExportModal;