import React from 'react';
import { Path, Svg } from 'react-native-svg';


export const CameraIcon = ({ color, ...props }: any) => {
  return (
    <Svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12 16.5a3 3 0 100-6 3 3 0 000 6z"
        stroke="#161D29"
        strokeWidth={1.5}
      />
      <Path
        d="M2 13.864c0-3.065 0-4.597.749-5.697a4.4 4.4 0 011.226-1.204c.72-.473 1.622-.642 3.003-.702.659 0 1.226-.49 1.355-1.125A2.064 2.064 0 0110.366 3.5h3.268c.988 0 1.839.685 2.033 1.636.129.635.696 1.125 1.355 1.125 1.38.06 2.282.23 3.003.702.485.318.902.727 1.226 1.204.749 1.1.749 2.632.749 5.697s0 4.596-.749 5.697a4.399 4.399 0 01-1.226 1.204c-1.121.735-2.682.735-5.803.735H9.778c-3.121 0-4.682 0-5.803-.735A4.399 4.399 0 012.75 19.56a3.4 3.4 0 01-.473-1.06M19 10.5h-1"
        stroke="#161D29"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default CameraIcon;
