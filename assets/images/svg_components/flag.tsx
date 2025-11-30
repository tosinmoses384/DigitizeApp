import * as React from "react"
import Svg, { Path } from "react-native-svg"
const FlagComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill="#FF9DA5"
      d="M3.73.75v22.5h1.5v-6.375h16.5V15.13l-3.944-5.38 3.945-5.38V2.626H5.23V.75h-1.5Zm16.32 3.375L15.927 9.75l4.125 5.625H5.23V4.125h14.82Z"
    />
  </Svg>
)
export default FlagComponent
