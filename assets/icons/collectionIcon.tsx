import React from 'react';
import { Path, Svg } from 'react-native-svg';


export const CollectionIcon = ({ color, ...props }: any) => {
  return (
    <Svg
      width={20}
      height={15}
      viewBox="0 0 20 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M.895 0v15h18.214V0H.895zM5.18 2.143v2.143H3.037V2.143H5.18zM3.037 8.57V6.43H5.18V8.57H3.037zm0 2.143H5.18v2.143H3.037v-2.143zm13.929 2.143H7.323v-2.143h9.643v2.143zm0-4.286H7.323V6.43h9.643V8.57zm0-4.285H7.323V2.143h9.643v2.143z"
        fill="#90969E"
      />
    </Svg>
  );
};

export default CollectionIcon;
