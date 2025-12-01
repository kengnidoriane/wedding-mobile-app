import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ClockIconProps {
  size?: number;
  color?: string;
}

export const ClockIcon: React.FC<ClockIconProps> = ({ 
  size = 16, 
  color = '#FFFFFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
      <Path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
