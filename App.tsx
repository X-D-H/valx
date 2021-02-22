import { useNetInfo } from '@react-native-community/netinfo'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { setupData, validateData } from './API'

export default function App() {
  const netInfo = useNetInfo()

  const [cryptoSymbols, setCryptoSymbols] = useState(['btc', 'eth', 'nano', 'miota'])
  const [fiatSymbols, setFiatSymbols] = useState(['usd', 'eur', 'gbp', 'nok'])

  const [refreshCounter, setRefreshCounter] = useState(0)
  const [baseValue, setBaseValue] = useState('1')
  const [baseDivider, setBaseDivider] = useState(1)
  const [baseSymbol, setBaseSymbol] = useState('btc')

  const [cryptoData, setCryptoData] = useState(null)
  const [cryptoDataAge, setCryptoDataAge] = useState('...')

  const [fiatData, setFiatData] = useState(null)
  const [fiatDataAge, setFiatDataAge] = useState('...')

  useEffect(() => {
    setupData(netInfo, cryptoSymbols, fiatSymbols).then((r) => {
      setCryptoData(r.cryptoData)
      setCryptoDataAge(r.cryptoDataAge)

      setFiatData(r.fiatData)
      setFiatDataAge(r.fiatDataAge)
    })

    setTimeout(() => {
      setRefreshCounter(refreshCounter + 1)
    }, 1000)
  }, [refreshCounter])

  if (validateData(cryptoSymbols, fiatSymbols, cryptoData, fiatData)) {
    return (
      <View style={styles.container}>
        <View>
          <View style={styles.ticker}>
            <TextInput
              style={styles.tickerValue}
              onChangeText={(value) => {
                if (value.length < 20) {
                  setBaseValue(value.replace(',', '.'))
                }
              }}
              value={baseValue}
              keyboardType="numeric"
              autoFocus={true}
              keyboardAppearance="dark"
            />
            <Text style={styles.tickerSymbol}>{baseSymbol.toUpperCase()}</Text>
          </View>
          <Text style={styles.text}>------------------------------------</Text>

          <View style={styles.tickers}>
            {fiatSymbols
              .filter((s) => s != baseSymbol)
              .map((symbol, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.ticker}
                  onPress={() => {
                    setBaseDivider(fiatData.rates[symbol.toUpperCase()])
                    setBaseSymbol(symbol)
                  }}
                >
                  {cryptoSymbols.includes(baseSymbol) ? (
                    <Text style={styles.tickerValue}>
                      {(fiatData.rates[symbol.toUpperCase()] * baseDivider * baseValue).toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={styles.tickerValue}>
                      {((baseValue * fiatData.rates[symbol.toUpperCase()]) / baseDivider).toFixed(2)}
                    </Text>
                  )}

                  <Text style={styles.tickerSymbol}>{symbol.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}

            {cryptoSymbols
              .filter((s) => s != baseSymbol)
              .map((symbol, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.ticker}
                  onPress={() => {
                    setBaseDivider(cryptoData[symbol.toUpperCase()].quote.USD.price)
                    setBaseSymbol(symbol)
                  }}
                >
                  {cryptoSymbols.includes(baseSymbol) ? (
                    <Text style={styles.tickerValue}>
                      {((cryptoData[symbol.toUpperCase()].quote.USD.price * baseValue) / baseDivider).toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={styles.tickerValue}>
                      {(((1 / cryptoData[symbol.toUpperCase()].quote.USD.price) * baseValue) / baseDivider).toFixed(2)}
                    </Text>
                  )}
                  <Text style={styles.tickerSymbol}>{symbol.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
          </View>

          <Text style={styles.text}>------------------------------------</Text>
          {/* <Text style={styles.text}>Data age</Text>
          <Text style={styles.text}>Crypto: {fiatDataAge}</Text>
          <Text style={styles.text}>Fiat: {cryptoDataAge}</Text> */}
        </View>
        <StatusBar style="light" />
      </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Getting rates, hang tight ...</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Dimensions.get('window').height / 6,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  tickers: {
    display: 'flex',
  },

  ticker: {
    marginTop: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  tickerSymbol: {
    color: '#fff',
    textAlign: 'right',
    minWidth: 64,
  },
  tickerValue: {
    color: '#fff',
    textAlign: 'right',
    flexGrow: 1,
  },
  text: {
    color: '#555',
  },
})
