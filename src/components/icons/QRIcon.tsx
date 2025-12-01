import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface QRIconProps {
  size?: number;
  color?: string;
}

export const QRIcon: React.FC<QRIconProps> = ({ 
  size = 16, 
  color = '#FFFFFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top left corner */}
      <Rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="5" y="5" width="4" height="4" fill={color} />
      
      {/* Top right corner */}
      <Rect x="13" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="15" y="5" width="4" height="4" fill={color} />
      
      {/* Bottom left corner */}
      <Rect x="3" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="5" y="15" width="4" height="4" fill={color} />
      
      {/* Bottom right dots */}
      <Rect x="13" y="13" width="3" height="3" fill={color} />
      <Rect x="18" y="13" width="3" height="3" fill={color} />
      <Rect x="13" y="18" width="3" height="3" fill={color} />
      <Rect x="18" y="18" width="3" height="3" fill={color} />
    </Svg>
  );
};
