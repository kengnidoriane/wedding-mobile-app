import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button';

export interface FilterOptions {
  status: 'all' | 'present' | 'absent';
  companions: 'all' | '0' | '1+' | '2+';
  table: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  availableTables: string[];
}

const FilterModal = memo<FilterModalProps>(function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableTables
}) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const handleReset = useCallback(() => {
    const resetFilters: FilterOptions = {
      status: 'all',
      companions: 'all',
      table: 'all'
    };
    setFilters(resetFilters);
  }, []);

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FilterOption = ({ 
    label, 
    selected, 
    onPress 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.option, selected && styles.selectedOption]} 
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
        {label}
      </Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Filtres</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetButton}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <FilterSection title="Statut de présence">
              <FilterOption
                label="Tous"
                selected={filters.status === 'all'}
                onPress={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              />
              <FilterOption
                label="✅ Présents"
                selected={filters.status === 'present'}
                onPress={() => setFilters(prev => ({ ...prev, status: 'present' }))}
              />
              <FilterOption
                label="⏳ Absents"
                selected={filters.status === 'absent'}
                onPress={() => setFilters(prev => ({ ...prev, status: 'absent' }))}
              />
            </FilterSection>

            <FilterSection title="Nombre d'accompagnants">
              <FilterOption
                label="Tous"
                selected={filters.companions === 'all'}
                onPress={() => setFilters(prev => ({ ...prev, companions: 'all' }))}
              />
              <FilterOption
                label="Sans accompagnant (0)"
                selected={filters.companions === '0'}
                onPress={() => setFilters(prev => ({ ...prev, companions: '0' }))}
              />
              <FilterOption
                label="1 accompagnant ou plus"
                selected={filters.companions === '1+'}
                onPress={() => setFilters(prev => ({ ...prev, companions: '1+' }))}
              />
              <FilterOption
                label="2 accompagnants ou plus"
                selected={filters.companions === '2+'}
                onPress={() => setFilters(prev => ({ ...prev, companions: '2+' }))}
              />
            </FilterSection>

            <FilterSection title="Table">
              <FilterOption
                label="Toutes les tables"
                selected={filters.table === 'all'}
                onPress={() => setFilters(prev => ({ ...prev, table: 'all' }))}
              />
              {availableTables.map(table => (
                <FilterOption
                  key={table}
                  label={`Table ${table}`}
                  selected={filters.table === table}
                  onPress={() => setFilters(prev => ({ ...prev, table }))}
                />
              ))}
            </FilterSection>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Appliquer les filtres"
              onPress={handleApply}
              variant="primary"
              size="lg"
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
    maxHeight: '80%',
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
  resetButton: {
    fontSize: 17,
    color: '#FF3B30',
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
});

export default FilterModal;