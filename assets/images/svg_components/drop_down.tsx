import * as React from "react"
import Svg, { Path } from "react-native-svg"
const DropDownArrowComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      fill="#637381"
      d="M10 13.418a.833.833 0 0 1-.533-.192l-5-4.166a.834.834 0 0 1 1.067-1.284L10 11.51l4.467-3.6a.833.833 0 0 1 1.175.125.833.833 0 0 1-.117 1.216l-5 4.025a.833.833 0 0 1-.525.142Z"
    />
  </Svg>
)
export default DropDownArrowComponent
