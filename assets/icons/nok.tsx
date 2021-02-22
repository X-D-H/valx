import * as React from 'react'
import Svg, { Circle, Rect, Path, G } from 'react-native-svg'

export default function SvgComponent(props) {
  return (
    <Svg id="flag-icon-css-no" viewBox="0 0 512 512">
      <Path fill="#ed2939" d="M0 0h512v512H0z" />
      <Path fill="#fff" d="M128 0h128v512H128z" />
      <Path fill="#fff" d="M0 192h512v128H0z" />
      <Path fill="#002664" d="M160 0h64v512h-64z" />
      <Path fill="#002664" d="M0 224h512v64H0z" />
    </Svg>
  )
}
