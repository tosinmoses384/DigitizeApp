import React from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

interface EditIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const EditIcon: React.FC<EditIconProps> = ({ width = 16, height = 16, color = '#232323' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_29426_51572)">
        <Path
          d="M2 11.4997V13.9997H4.5L11.8733 6.62638L9.37333 4.12638L2 11.4997ZM13.8067 4.69305C14.0667 4.43305 14.0667 4.01305 13.8067 3.75305L12.2467 2.19305C11.9867 1.93305 11.5667 1.93305 11.3067 2.19305L10.0867 3.41305L12.5867 5.91305L13.8067 4.69305Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_29426_51572">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default EditIcon;
