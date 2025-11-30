import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const EditIconComponent = (props: SvgProps) => (
  <Svg
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <Path
      stroke="#FF9DA5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.333}
      d="m15.73 6.154 3 3m-5 11h8m-16-4-1 4 4-1L20.317 7.568a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0L5.73 16.154Z"
    />
  </Svg>
)
export default EditIconComponent