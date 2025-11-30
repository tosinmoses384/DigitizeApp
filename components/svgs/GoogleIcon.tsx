import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface Props extends SvgProps {
  //
}

function SvgComponent(props: Props) {
  return (
    <Svg
      //@ts-ignore
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <Path
        fill="#FFC107"
        d="M21.805 10.041H21V10h-9v4h5.651A5.998 5.998 0 0 1 6 12a6 6 0 0 1 6-6c1.53 0 2.921.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0 0 12 2C6.478 2 2 6.478 2 12c0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10 0-.67-.069-1.325-.195-1.959Z"
      />
      <Path
        fill="#FF3D00"
        d="m3.153 7.346 3.286 2.409A5.997 5.997 0 0 1 12 6c1.53 0 2.921.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0 0 12 2a9.994 9.994 0 0 0-8.847 5.346Z"
      />
      <Path
        fill="#4CAF50"
        d="M12 22c2.583 0 4.93-.988 6.704-2.596l-3.095-2.619A5.95 5.95 0 0 1 12 18a5.997 5.997 0 0 1-5.642-3.973l-3.26 2.513C4.751 19.778 8.112 22 12 22Z"
      />
      <Path
        fill="#1976D2"
        d="M21.805 10.041H21V10h-9v4h5.651a6.02 6.02 0 0 1-2.043 2.785h.002l3.095 2.619C18.485 19.602 22 17 22 12c0-.67-.069-1.325-.195-1.959Z"
      />
    </Svg>
  );
}

const GoogleIcon = React.memo(SvgComponent);
export default GoogleIcon;
