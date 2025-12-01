import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface FilterIconProps {
  size?: number;
  color?: string;
  hasActiveFilters?: boolean;
}

export const FilterIcon: React.FC<FilterIconProps> = ({ 
  size = 20, 
  color = '#007AFF',
  hasActiveFilters = false 
}) => {
  return (
    <View style={[styles.container, hasActiveFilters && styles.activeContainer]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 4.5H21V6.5H3V4.5Z"
          fill={hasActiveFilters ? '#FFFFFF' : color}
        />
        <Path
          d="M7 11H17V13H7V11Z"
          fill={hasActiveFilters ? '#FFFFFF' : color}
        />
        <Path
          d="M10 17.5H14V19.5H10V17.5Z"
          fill={hasActiveFilters ? '#FFFFFF' : color}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeContainer: {
    backgroundColor: '#007AFF',
  },
});
