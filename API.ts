import AsyncStorage from '@react-native-async-storage/async-storage'
import { CRYPTO_API_KEY, CRYPTO_API_BASE_URL, CRYPTO_API_CREDITS_PER_MONTH, FIAT_API_BASE_URL } from '@env'

const maxCallsEachHour = CRYPTO_API_CREDITS_PER_MONTH / 31 / 24
const oneHourInMs = 1000 * 60 * 60
const minMsBetweenEachCall = oneHourInMs / maxCallsEachHour
const fiatBase = 'usd'

export function getCachedData(type: string, symbols: [string]) {
  return new Promise((resolve, reject) => {
    try {
      AsyncStorage.getItem(type + symbols.join(',')).then((res) => {
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

export function getLiveData(type: string, symbols: [string]) {
  return new Promise((resolve, reject) => {
    let url: string
    let params: URLSearchParams
    const headers: { [key: string]: string } = {}

    if (type === 'crypto') {
      console.log('GET LIVE ' + type)
      headers['X-CMC_PRO_API_KEY'] = CRYPTO_API_KEY

      params = new URLSearchParams({
        symbol: symbols.join(','),
      })

      url = CRYPTO_API_BASE_URL + '/v1/cryptocurrency/quotes/latest?' + params
    } else if (type === 'fiat') {
      console.log('GET LIVE ' + type)
      params = new URLSearchParams({
        base: fiatBase.toUpperCase(),
        symbols: symbols.join(',').toUpperCase(),
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

          console.log('LIVE DATA vvvvv LIVE DATA')
          console.log(json)
          console.log('LIVE DATA ^^^^^ LIVE DATA')
          AsyncStorage.setItem(type + symbols.join(','), JSON.stringify(json))
        } catch (e) {
          console.error(e)
        }

        resolve(r)
      })
      .catch((e) => reject(e))
  })
}

export const setupData = (netInfo, cryptoSymbols, fiatSymbols) =>
  new Promise((resolve, reject) => {
    const data: { [key: string]: any } = {
      cryptoReady: false,
      fiatReady: false,
    }

    getCachedData('crypto', cryptoSymbols).then((r) => {
      if (r === null && netInfo.isConnected) {
        // Live data
        getLiveData('crypto', cryptoSymbols).then((r) => {
          data.cryptoData = r.data
          data.cryptoDataAge = 'Right now'
          data.cryptoReady = true
        })
      } else {
        // Cached data
        const diffInMs = new Date() - new Date(r.date)

        if (diffInMs > minMsBetweenEachCall && netInfo.isConnected) {
          getLiveData('crypto', cryptoSymbols).then((r) => {
            data.cryptoData = r.data
            data.cryptoDataAge = 'Right now'
            data.cryptoReady = true
          })
        } else {
          //   console.log('cached crypto', r.date, diffInMs, minMsBetweenEachCall)

          const diff = new Date(diffInMs)
          let dataAge = diff.getSeconds() + ' seconds ago'
          if (diff.getSeconds() >= 60) {
            dataAge = diff.getMinutes() + ' minute ago'
          } else if (diff.getSeconds() >= 120) {
            dataAge = diff.getMinutes() + ' minutes ago'
          }

          data.cryptoData = r.data
          data.cryptoDataAge = dataAge
          data.cryptoReady = true
        }
      }
    })

    getCachedData('fiat', fiatSymbols).then((r) => {
      if (r === null && netInfo.isConnected) {
        // Live data
        getLiveData('fiat', fiatSymbols).then((r) => {
          data.fiatData = r.data
          data.fiatDataAge = 'Right now'
          data.fiatReady = true
        })
      } else {
        // Cached data
        const diffInMs = new Date() - new Date(r.date)

        if (diffInMs > minMsBetweenEachCall && netInfo.isConnected) {
          getLiveData('fiat', fiatSymbols).then((r) => {
            data.fiatData = r.data
            data.fiatDataAge = 'Right now'
            data.fiatReady = true
          })
        } else {
          //   console.log('cached fiat', r.date, diffInMs, minMsBetweenEachCall)

          const diff = new Date(diffInMs)
          let dataAge = diff.getSeconds() + ' seconds ago'
          if (diff.getSeconds() >= 60) {
            dataAge = diff.getMinutes() + ' minute ago'
          } else if (diff.getSeconds() >= 120) {
            dataAge = diff.getMinutes() + ' minutes ago'
          }

          data.fiatData = r.data
          data.fiatDataAge = dataAge
          data.fiatReady = true
        }
      }
    })

    const interval = setInterval(() => {
      if (data.cryptoReady && data.fiatReady) {
        clearInterval(interval)
        resolve(data)
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      reject(data)
    }, 2000)
  })

export function validateData(cryptoSymbols: [], fiatSymbols: [], cryptoData: {}, fiatData: {}): boolean {
  let errors = 2

  try {
    if (!cryptoData) {
      errors++
    }

    cryptoSymbols.map((symbol) => {
      cryptoData[symbol.toUpperCase()].quote !== null &&
        cryptoData[symbol.toUpperCase()].quote.USD !== null &&
        cryptoData[symbol.toUpperCase()].quote.USD.price !== null
    })

    errors--
  } catch (error) {
    console.log('Error with crypto data')
    console.log(error)
    errors++
  }

  try {
    if (!fiatData || !fiatData.rates) {
      errors++
    }

    fiatSymbols.map((symbol) => {
      fiatData.rates[symbol.toUpperCase()] !== null
    })

    errors--
  } catch (error) {
    console.log('Error with fiat data')
    console.log(error)
    errors++
  }

  return errors === 0
}
