import React from 'react';
import { Path, Svg } from 'react-native-svg';


export const InboxIcon = ({ color, ...props }: any) => {
  return (
    <Svg
    width={22}
    height={22}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11 1v8m0 0l3-3m-3 3L8 6"
      stroke="#6B727E"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 12h3.16c.905 0 1.358 0 1.756.183.398.183.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214.398.183.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183.398-.183.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214.398-.183.85-.183 1.756-.183H21"
      stroke="#6B727E"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M16 1.129c1.625.16 2.72.52 3.535 1.338C21 3.93 21 6.287 21 11.002c0 4.714 0 7.07-1.465 8.536-1.463 1.464-3.821 1.464-8.535 1.464s-7.071 0-8.536-1.464C1 18.072 1 15.716 1 11.002c0-4.714 0-7.07 1.464-8.535C3.281 1.65 4.374 1.289 6 1.129"
      stroke="#6B727E"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
  );
};

export default InboxIcon;
