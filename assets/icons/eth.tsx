import * as React from 'react'
import Svg, { Circle, Rect, Path, G } from 'react-native-svg'

export default function SvgComponent(props) {
  return (
    <Svg width="32" height="32">
      <G fill="none" fill-rule="evenodd">
        <Circle cx="16" cy="16" r="16" fill="#627EEA" />
        <G fill="#FFF" fill-rule="nonzero">
          <Path fill-opacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
          <Path d="M16.498 4L9 16.22l7.498-3.35z" />
          <Path fill-opacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
          <Path d="M16.498 27.995v-6.028L9 17.616z" />
          <Path fill-opacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
          <Path fill-opacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
        </G>
      </G>
    </Svg>
  )
}
