import React from 'react';
import { Path, Svg } from 'react-native-svg';


export const UploadIcon = ({ color, ...props }: any) => {
  return (
    <Svg
      width={14}
      height={15}
      viewBox="0 0 14 15"
      fill="none"
      {...props}
    >
      <Path
        d="M12.25 2.25v10.5H1.75V2.25h10.5zm0-1.5H1.75c-.825 0-1.5.675-1.5 1.5v10.5c0 .825.675 1.5 1.5 1.5h10.5c.825 0 1.5-.675 1.5-1.5V2.25c0-.825-.675-1.5-1.5-1.5zM8.605 7.395l-2.25 2.902L4.75 8.355 2.5 11.25h9L8.605 7.395z"
        fill="#464F5D"
      />
    </Svg>
  );
};

export default UploadIcon;
