






import * as React from "react"
import Svg, { Path } from "react-native-svg"
const PlanCalendarSvg = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      stroke="#FF5C68"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.324}
      d="M14 2.167V5.5M7.332 2.167V5.5M3.166 8.833h15m-13.333-5h11.666c.92 0 1.667.747 1.667 1.667v11.667c0 .92-.746 1.666-1.667 1.666H4.833c-.92 0-1.667-.746-1.667-1.666V5.5c0-.92.746-1.667 1.667-1.667Z"
    />
  </Svg>
)
export default PlanCalendarSvg
