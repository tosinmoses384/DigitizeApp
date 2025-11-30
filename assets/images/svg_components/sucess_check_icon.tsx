import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const SuccessCheckIcon = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <Rect width={14} height={14} x={1} y={1} fill="#077903" rx={7} />
    <Path
      fill="#ECF1EA"
      d="m6.366 10.1 5.65-5.65a.64.64 0 0 1 .467-.2.64.64 0 0 1 .467.2.65.65 0 0 1 .2.475.647.647 0 0 1-.2.475l-6.117 6.133a.64.64 0 0 1-.467.2.64.64 0 0 1-.466-.2L3.033 8.667a.621.621 0 0 1-.192-.475.68.68 0 0 1 .209-.475.647.647 0 0 1 .475-.2c.183 0 .341.067.475.2L6.366 10.1Z"
    />
  </Svg>
)
export default SuccessCheckIcon
