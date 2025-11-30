import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const DeleteIconComponent = (props: SvgProps) => (
  <Svg
    width={20}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      stroke="#FF9DA5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.2 4.169v12.514a2.72 2.72 0 0 0 2.721 2.72h7.618a2.72 2.72 0 0 0 2.72-2.72V4.169m-15.235 0h17.412"
    />
    <Path
      stroke="#FF9DA5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6.466 4.169V2.536A1.63 1.63 0 0 1 8.099.904h3.264a1.63 1.63 0 0 1 1.633 1.632v1.633M7.555 15.146v-5.44m4.353 5.44v-5.44"
    />
  </Svg>
)
export default DeleteIconComponent
