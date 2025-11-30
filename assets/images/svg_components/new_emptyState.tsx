






import * as React from "react"
import Svg, { Rect, Path, Circle, G, Defs, ClipPath } from "react-native-svg"

const NewEptyStateSvg = (props) => (
  <Svg
    width={200}
    height={200}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <Rect width={167} height={38} x={21} y={29} fill="#E9EAEB" rx={19} />
    <Path
      fill="#E9EAEB"
      d="M167.092 78.916c11.493 0 20.81 9.317 20.81 20.81 0 8.569-5.179 15.926-12.577 19.117a20.718 20.718 0 0 1 2.278 9.471c-.001 11.494-9.318 20.81-20.811 20.81H52.32c-11.493 0-20.81-9.317-20.81-20.81 0-3.381.807-6.574 2.238-9.397C26.258 115.767 21 108.361 21 99.727c0-11.494 9.317-20.811 20.81-20.811h125.282Z"
    />
    <Circle
      cx={31.841}
      cy={99.153}
      r={4.153}
      fill="#E9EAEB"
      stroke="#fff"
      strokeWidth={2}
    />
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M176.731 95.595a.963.963 0 1 0-1.929 0v2.482h-2.482a.967.967 0 0 0-.965.965c0 .53.435.964.965.964h2.482v2.479c0 .529.431.964.964.964.53 0 .965-.431.965-.964v-2.479h2.479a.966.966 0 0 0 .964-.965.967.967 0 0 0-.964-.964h-2.479v-2.482Z"
      />
    </G>
    <Rect
      width={87.974}
      height={101.078}
      x={42.234}
      y={31.935}
      fill="#fff"
      stroke="#E9EAEB"
      strokeDasharray="11 11"
      strokeWidth={2}
      rx={9}
      transform="rotate(-9 42.234 31.935)"
    />
    <Rect
      width={87.974}
      height={101.079}
      x={76.754}
      y={18.173}
      fill="#fff"
      stroke="#E9EAEB"
      strokeDasharray="11 11"
      strokeWidth={2}
      rx={9}
      transform="rotate(9 76.754 18.173)"
    />
    <Rect
      width={87.974}
      height={118.243}
      x={59.118}
      y={17.123}
      fill="#fff"
      stroke="#E9EAEB"
      strokeDasharray="11 11"
      strokeWidth={2}
      rx={9}
    />
    <Path
      fill="#F6F7F7"
      d="M133.48 76.245c0 16.775-13.599 30.374-30.375 30.374-16.775 0-30.374-13.599-30.374-30.374 0-16.776 13.599-30.375 30.374-30.375 16.776 0 30.375 13.6 30.375 30.375Z"
    />
    <Path
      fill="#B5B9BE"
      d="M107.257 61.833c0-2.229-1.817-4.06-4.06-4.06-2.242 0-4.074 1.831-4.06 4.06v10.443H88.694a4.069 4.069 0 0 0-4.06 4.06c0 2.23 1.83 4.06 4.06 4.06h10.443v10.43a4.07 4.07 0 0 0 4.06 4.06 4.069 4.069 0 0 0 4.06-4.06v-10.43h10.43a4.069 4.069 0 0 0 4.06-4.06c0-2.229-1.818-4.06-4.06-4.06h-10.43V61.833Z"
    />
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M170.725 94h10.09v10.09h-10.09z" />
      </ClipPath>
    </Defs>
  </Svg>
)

export default NewEptyStateSvg
