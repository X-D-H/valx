import * as React from 'react'
import Svg, { Circle, Rect, Path, G, Use, Defs } from 'react-native-svg'

export default function SvgComponent(props) {
  return (
    <Svg id="flag-icon-css-eu" viewBox="0 0 512 512">
      <Defs>
        <G id="d">
          <G id="b">
            <Path id="a" d="M0-1l-.3 1 .5.1z" />
            <Use transform="scale(-1 1)" href="#a" />
          </G>
          <G id="c">
            <Use transform="rotate(72)" href="#b" />
            <Use transform="rotate(144)" href="#b" />
          </G>
          <Use transform="scale(-1 1)" href="#c" />
        </G>
      </Defs>
      <Path fill="#039" d="M0 0h512v512H0z" />
      <G fill="#fc0" transform="translate(256 258.4) scale(25.28395)">
        <Use width="100%" height="100%" y="-6" href="#d" />
        <Use width="100%" height="100%" y="6" href="#d" />
        <G id="e">
          <Use width="100%" height="100%" x="-6" href="#d" />
          <Use width="100%" height="100%" transform="rotate(-144 -2.3 -2.1)" href="#d" />
          <Use width="100%" height="100%" transform="rotate(144 -2.1 -2.3)" href="#d" />
          <Use width="100%" height="100%" transform="rotate(72 -4.7 -2)" href="#d" />
          <Use width="100%" height="100%" transform="rotate(72 -5 .5)" href="#d" />
        </G>
        <Use width="100%" height="100%" transform="scale(-1 1)" href="#e" />
      </G>
    </Svg>
  )
}
