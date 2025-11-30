import * as React from "react"
import Svg, { Path } from "react-native-svg"
const AddCircleSvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill="#464F5D"
      d="M12 20.16A8.153 8.153 0 0 1 3.84 12 8.153 8.153 0 0 1 12 3.84 8.153 8.153 0 0 1 20.16 12 8.153 8.153 0 0 1 12 20.16ZM12 4.8A7.19 7.19 0 0 0 4.8 12a7.19 7.19 0 0 0 7.2 7.2 7.19 7.19 0 0 0 7.2-7.2A7.19 7.19 0 0 0 12 4.8Z"
    />
    <Path fill="#464F5D" d="M7.68 11.52h8.64v.96H7.68v-.96Z" />
    <Path fill="#464F5D" d="M11.52 7.68h.96v8.64h-.96V7.68Z" />
  </Svg>
)
export default AddCircleSvgComponent
