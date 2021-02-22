import * as React from 'react'
import { View, Text } from 'react-native'

import BtcIcon from '../assets/icons/btc'
import EthIcon from '../assets/icons/eth'
import NanoIcon from '../assets/icons/nano'
import MiotaIcon from '../assets/icons/miota'
import UsdIcon from '../assets/icons/usd'
import EurIcon from '../assets/icons/eur'
import GbpIcon from '../assets/icons/gbp'
import NokIcon from '../assets/icons/nok'

export default function Symbol(props) {
  if (props.name === 'btc') return <BtcIcon />
  if (props.name === 'eth') return <EthIcon />
  if (props.name === 'nano') return <NanoIcon />
  if (props.name === 'miota') return <MiotaIcon />
  if (props.name === 'usd') return <UsdIcon />
  if (props.name === 'eur') return <EurIcon />
  if (props.name === 'gbp') return <GbpIcon />
  if (props.name === 'nok') return <NokIcon />

  return <Text>Invalid name</Text>
}
