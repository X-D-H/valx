import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CRYPTO_API_KEY, CRYPTO_API_BASE_URL, CRYPTO_API_CREDITS_PER_MONTH, FIAT_API_BASE_URL } from '@env'

const debug = false

const maxCallsEachHour = CRYPTO_API_CREDITS_PER_MONTH / 31 / 24
const oneHourInMs = 1000 * 60 * 60
const minMsBetweenEachCall = oneHourInMs / maxCallsEachHour
const cryptoSymbols = ['btc', 'eth', 'nano', 'miota']

const fiatBase = 'usd'
const fiatSymbols = ['gbp', 'eur', 'nok']

export default function App() {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [input, setInput] = useState('1')

  const [cryptoData, setCryptoData] = useState(null)
  const [cryptoDataAge, setCryptoDataAge] = useState('x minutes ago')

  const [fiatData, setFiatData] = useState(null)
  const [fiatDataAge, setFiatDataAge] = useState('x minutes ago')

  const useLiveData = (type: string) => {
    getLiveData(type).then((r) => {
      console.log('live', r)
      if (type === 'crypto') {
        setCryptoData(r.data)
        setCryptoDataAge('Right now')
      } else if (type === 'crypto') {
        setFiatData(r.data)
        setFiatDataAge('Right now')
      }
    })
  }

  const setupData = () => {
    getCachedData('crypto').then((r) => {
      if (r === null) {
        // Live data
        useLiveData('crypto')
      } else {
        // Cached data
        const diffInMs = new Date() - new Date(r.date)

        if (diffInMs > minMsBetweenEachCall) {
          useLiveData('crypto')
        } else {
          console.log('cached crypto', r.date, diffInMs, minMsBetweenEachCall)

          const diff = new Date(diffInMs)
          let dataAge = diff.getSeconds() + ' seconds ago'
          if (diff.getSeconds() >= 60) {
            dataAge = diff.getMinutes() + ' minute ago'
          } else if (diff.getSeconds() >= 120) {
            dataAge = diff.getMinutes() + ' minutes ago'
          }

          setCryptoData(r.data)
          setCryptoDataAge(dataAge)
        }
      }
    })

    getCachedData('fiat').then((r) => {
      if (r === null) {
        // Live data
        useLiveData('fiat')
      } else {
        // Cached data
        const diffInMs = new Date() - new Date(r.date)

        if (diffInMs > minMsBetweenEachCall) {
          useLiveData('fiat')
        } else {
          console.log('cached fiat', r.date, diffInMs, minMsBetweenEachCall)

          const diff = new Date(diffInMs)
          let dataAge = diff.getSeconds() + ' seconds ago'
          if (diff.getSeconds() >= 60) {
            dataAge = diff.getMinutes() + ' minute ago'
          } else if (diff.getSeconds() >= 120) {
            dataAge = diff.getMinutes() + ' minutes ago'
          }

          setFiatData(r.data)
          setFiatDataAge(dataAge)
        }
      }
    })
  }

  let priceInterval = null
  useEffect(() => {
    setupData()

    setTimeout(() => {
      setRefreshCounter(refreshCounter + 1)
    }, 5000)
  }, [refreshCounter])

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.ticker}>
          <TextInput
            style={styles.tickerValue}
            onChangeText={(value) => setInput(value)}
            value={input}
            keyboardType="numeric"
            autoFocus={true}
            keyboardAppearance="dark"
          />
          <Text style={styles.tickerValueSymbol}>US$</Text>
        </View>
        <Text>------------------------------------</Text>

        <View style={styles.tickers}>
          {fiatData &&
            fiatData.rates &&
            fiatSymbols.map((symbol, i) => (
              <View key={i} style={styles.ticker}>
                <Text style={styles.tickerSymbol}>{symbol.toUpperCase()}: </Text>
                <Text style={styles.tickerValue}>{(input * fiatData.rates[symbol.toUpperCase()]).toFixed(2)}</Text>
                <Text style={styles.tickerValueSymbol}>US$</Text>
              </View>
            ))}

          {cryptoData &&
            cryptoSymbols.map((symbol, i) => (
              <View key={i} style={styles.ticker}>
                <Text style={styles.tickerSymbol}>{symbol.toUpperCase()}: </Text>
                <Text style={styles.tickerValue}>
                  {((1 / cryptoData[symbol.toUpperCase()].quote.USD.price) * input).toFixed(2)}
                </Text>
                <Text style={styles.tickerValueSymbol}>US$</Text>
              </View>
            ))}
        </View>

        <Text>------------------------------------</Text>
        <Text style={styles.text}>Data age</Text>
        <Text style={styles.text}>Crypto: {fiatDataAge}</Text>
        <Text style={styles.text}>Fiat: {cryptoDataAge}</Text>
      </View>
      <StatusBar style="light" />
    </View>
  )
}

function getCachedData(type: string) {
  return new Promise((resolve, reject) => {
    try {
      AsyncStorage.getItem(type).then((res) => {
        if (res != null) {
          const data = JSON.parse(res)
          resolve(data)
        } else {
          resolve(null)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function getLiveData(type: string) {
  return new Promise((resolve, reject) => {
    let url, params
    const headers = {}

    if (type === 'crypto') {
      console.log('GET LIVE ' + type)
      headers['X-CMC_PRO_API_KEY'] = CRYPTO_API_KEY

      params = new URLSearchParams({
        symbol: cryptoSymbols.join(','),
      })

      url = CRYPTO_API_BASE_URL + '/v1/cryptocurrency/quotes/latest?' + params
    } else if (type === 'fiat') {
      console.log('GET LIVE ' + type)
      params = new URLSearchParams({
        base: fiatBase.toUpperCase(),
        symbols: fiatSymbols.join(',').toUpperCase(),
      })

      url = FIAT_API_BASE_URL + '/latest?' + params
    } else {
      throw new Error("Invalid type. Must be 'crypto' or 'fiat'")
    }

    console.log(url)

    fetch(url, {
      method: 'GET',
      headers,
    })
      .then((r) => r.json())
      .then((r) => {
        try {
          let json = { date: new Date(), data: null }

          if (type === 'crypto') {
            json.data = r.data
          } else if (type === 'fiat') {
            json.data = r
          }

          AsyncStorage.setItem(type, JSON.stringify(json))
        } catch (e) {
          console.error(e)
        }

        resolve(r)
      })
      .catch((e) => reject(e))
  })
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
  },
  tickerValue: {
    color: '#fff',
    textAlign: 'right',
    flexGrow: 1,
    paddingRight: 16,
  },
  tickerValueSymbol: {
    color: '#fff',
  },
  text: {
    color: '#555',
  },
})
