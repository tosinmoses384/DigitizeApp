import * as React from "react"
import Svg, { Path } from "react-native-svg"
const ShareComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      stroke="#FF9DA5"
      strokeWidth={1.9}
      d="M6.73 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
    />
    <Path
      stroke="#FF9DA5"
      strokeLinecap="round"
      strokeWidth={1.9}
      d="m11.73 4.5-5 3.5m5 7.5-5-3.5"
    />
    <Path
      stroke="#FF9DA5"
      strokeWidth={1.9}
      d="M16.73 16.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0-13a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
    />
  </Svg>
)
export default ShareComponent
