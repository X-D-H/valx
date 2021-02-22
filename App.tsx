import { SafeAreaView } from 'react-native-safe-area-context'

import { useNetInfo } from '@react-native-community/netinfo'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { setupData, validateData } from './API'

import Symbol from './components/Symbol'

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
        <SafeAreaView style={styles.fullWidth}>
          <ScrollView style={styles.fullWidth}>
            <View style={styles.tickers}>
              <View style={styles.ticker}>
                <TextInput
                  style={[styles.tickerValue, { borderBottomColor: '#CCFFDA', borderBottomWidth: 1 }]}
                  onChangeText={(value) => {
                    if (value.length < 12) {
                      setBaseValue(value.replace(',', '.'))
                    }
                  }}
                  value={baseValue}
                  keyboardType="numeric"
                  autoFocus={true}
                  keyboardAppearance="dark"
                />
                <View style={styles.tickerSymbol}>
                  <Text style={styles.tickerSymbolText}>{baseSymbol.toUpperCase()}</Text>
                  <View style={styles.tickerSymbolIcon}>
                    <Symbol name={baseSymbol} />
                  </View>
                </View>
              </View>
            </View>

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

                    <View style={styles.tickerSymbol}>
                      <Text style={styles.tickerSymbolText}>{symbol.toUpperCase()}</Text>
                      <View style={styles.tickerSymbolIcon}>
                        <Symbol name={symbol} />
                      </View>
                    </View>
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
                        {(((1 / cryptoData[symbol.toUpperCase()].quote.USD.price) * baseValue) / baseDivider).toFixed(
                          2
                        )}
                      </Text>
                    )}
                    <View style={styles.tickerSymbol}>
                      <Text style={styles.tickerSymbolText}>{symbol.toUpperCase()}</Text>
                      <View style={styles.tickerSymbolIcon}>
                        <Symbol name={symbol} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.spacer}></View>

            {/* <Text style={styles.text}>Data age</Text>
          <Text style={styles.text}>Crypto: {fiatDataAge}</Text>
          <Text style={styles.text}>Fiat: {cryptoDataAge}</Text> */}
          </ScrollView>
        </SafeAreaView>
        <StatusBar style="light" />
      </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.fullWidth}>
          <Text style={styles.text}>Getting rates, hang tight ...</Text>
        </SafeAreaView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fullWidth: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  spacer: {
    height: Dimensions.get('window').height / 2,
  },
  tickers: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  ticker: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickerSymbol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tickerSymbolText: {
    fontSize: 24,
    fontFamily: 'Menlo',
    fontWeight: 'normal',
    color: '#CCFFDA',
    minWidth: 128,
    textAlign: 'right',
    paddingRight: 16,
  },
  tickerSymbolIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickerValue: {
    color: '#CCFFDA',
    textAlign: 'right',
    flexGrow: 1,
    fontSize: 24,
    paddingRight: 8,
    fontFamily: 'Menlo',
    maxWidth: Dimensions.get('window').width / 2,
  },
  text: {
    color: '#555',
  },
})
