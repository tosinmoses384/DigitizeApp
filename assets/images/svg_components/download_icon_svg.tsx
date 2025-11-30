import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const DownloadIconSvg = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={19}
    fill="none"
    {...props}
  >
    <Path
      stroke="#FF9DA5"
      strokeWidth={1.3}
      d="M13.173 6.904H11.98v-3.75a.752.752 0 0 0-.75-.75h-3a.752.752 0 0 0-.75.75v3.75H6.288c-.668 0-1.005.81-.533 1.282l3.443 3.443a.747.747 0 0 0 1.057 0l3.443-3.443c.473-.472.143-1.282-.525-1.282Zm-8.693 7.5c0 .412.338.75.75.75h9c.413 0 .75-.338.75-.75a.752.752 0 0 0-.75-.75h-9a.752.752 0 0 0-.75.75Z"
    />
  </Svg>
)
export default DownloadIconSvg
