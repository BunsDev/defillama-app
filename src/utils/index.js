import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ICONS_CDN, ICONS_PALETTE_CDN, timeframeOptions } from '~/constants'
export * from './blockExplorers'
import { colord, extend } from 'colord'
import lchPlugin from 'colord/plugins/lch'
import relativeTime from 'dayjs/plugin/relativeTime'

extend([lchPlugin])
dayjs.extend(utc)
dayjs.extend(relativeTime)

export function getTimeframe(timeWindow) {
	const utcEndTime = dayjs.utc()
	// based on window, get starttime
	let utcStartTime
	switch (timeWindow) {
		case timeframeOptions.WEEK:
			utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
			break
		case timeframeOptions.MONTH:
			utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
			break
		case timeframeOptions.ALL_TIME:
			utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
			break
		case timeframeOptions.YEAR:
			utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
			break
		default:
			utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
			break
	}
	return utcStartTime
}

/** gives output like `5 days ago` or `17 hours ago` from a timestamp, https://day.js.org/docs/en/plugin/relative-time */
export const toNiceDaysAgo = (date) => dayjs().to(dayjs.utc(dayjs.unix(date)))

export const toNiceDayAndHour = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('D MMM, HH:mm')
}
export const toNiceHour = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('HH:mm')
}
export const toNiceDayMonthAndYear = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('D MMM, YYYY, HH:mm')
}

export const toNiceDayMonthAndYearAndTime = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('D MMM, YYYY HH:mm')
}

export const toNiceMonthlyDate = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('MMM YYYY')
}

export const toYearMonth = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('YYYY-MM')
}

export const toNiceDate = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('MMM DD')
}

export const toNiceCsvDate = (date) => {
	return dayjs.utc(dayjs.unix(date)).format('YYYY-MM-DD')
}

export const toNiceDateYear = (date) => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const toNiceDayMonthYear = (date) => dayjs.utc(dayjs.unix(date)).format('DD MMM YYYY')

export const timeFromNow = (date) => dayjs.utc(dayjs.unix(date)).fromNow()

export function formatUnlocksEvent({ description, noOfTokens, timestamp, price, symbol }) {
	noOfTokens.forEach((tokens, i) => {
		description = description.replace(
			`{tokens[${i}]}`,
			`${formattedNum(tokens || 0) + (symbol ? ` ${symbol}` : '')}${
				price ? ` ($${formattedNum((tokens || 0) * price)})` : ''
			}`
		)
	})
	description = description?.replace('{timestamp}', `${toNiceDateYear(timestamp)} (${timeFromNow(timestamp)})`)
	return description
}

export const toK = (num) => {
	if ((!num && num !== 0) || Number.isNaN(Number(num))) {
		return null
	}

	const stringifiedNum = Number(num).toFixed(0)

	// 100 - 999_999
	if ([4, 5, 6].includes(stringifiedNum.length)) {
		return (+stringifiedNum / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'k'
	}

	// 1_000_000 - 999_999_999
	if ([7, 8, 9].includes(stringifiedNum.length)) {
		return (+stringifiedNum / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'm'
	}

	// 1_000_000_000 - 999_999_999_999
	if ([10, 11, 12].includes(stringifiedNum.length)) {
		return (+stringifiedNum / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 }) + 'b'
	}

	if (stringifiedNum.length > 12) {
		return (+stringifiedNum / 1_000_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 }) + 't'
	}

	return num.toLocaleString(undefined, {
		maximumFractionDigits: num > 0.1 ? 1 : num > 0.01 ? 2 : num > 0.0001 ? 3 : 5
	})
}

export const formattedNum = (number, symbol = false) => {
	let currencySymbol
	if (symbol === true) {
		currencySymbol = '$'
	} else if (symbol === false) {
		currencySymbol = ''
	} else {
		currencySymbol = symbol
	}

	if (number === '' || number === undefined || number === null || Number.isNaN(+number)) {
		return symbol ? `${currencySymbol}0` : `0`
	}
	let num = Number(number)
	const isNegative = num < 0
	num = Math.abs(num)

	const currencyMark = isNegative ? `-${currencySymbol}` : currencySymbol
	const normalMark = isNegative ? '-' : ''

	if (num > 1_000_000) {
		return `${symbol ? currencyMark : normalMark}${toK(num)}`
	}

	if (num === 0) {
		return symbol ? `${currencySymbol}0` : `0`
	}

	if (num < 0.0001 && num > 0) {
		return symbol ? `< ${currencySymbol}0.0001` : '< 0.0001'
	}

	if (num > 1_000) {
		return symbol
			? `${currencyMark}${Number(num.toFixed(0)).toLocaleString()}`
			: `${normalMark}${Number(num.toFixed(0)).toLocaleString()}`
	}

	if (symbol) {
		return `${currencyMark}${num.toLocaleString(undefined, {
			maximumFractionDigits: num > 0.1 ? 2 : num > 0.01 ? 3 : num > 0.0001 ? 4 : 5
		})}`
	}

	return `${num.toLocaleString(undefined, {
		maximumFractionDigits: num > 0.1 ? 2 : num > 0.01 ? 3 : num > 0.0001 ? 4 : 5
	})}`
}

export const filterCollectionsByCurrency = (collections, displayUsd) =>
	(collections &&
		collections.length &&
		collections.map((collection) => ({
			...collection,
			floor: displayUsd ? collection?.floorUSD : collection?.floor,
			dailyVolume: displayUsd ? collection?.dailyVolumeUSD : collection?.dailyVolume,
			totalVolume: displayUsd ? collection?.totalVolumeUSD : collection?.totalVolume
		}))) ||
	[]

export function chainIconUrl(chain) {
	return `${ICONS_CDN}/chains/rsz_${chain.toLowerCase()}?w=48&h=48`
}

export function chainIconPaletteUrl(chain) {
	return `${ICONS_PALETTE_CDN}/chains/rsz_${chain.toLowerCase()}`
}

export function tokenIconUrl(name) {
	const x = name ?? ''
	return `${ICONS_CDN}/protocols/${x
		.trim()
		.toLowerCase()
		.split(' ')
		.join('-')
		.split('(')
		.join('')
		.split(')')
		.join('')
		.split("'")
		.join('')
		.split('’')
		.join('')}?w=48&h=48`
}

export function tokenIconPaletteUrl(name) {
	if (!name) return null

	return `${ICONS_PALETTE_CDN}/protocols/${name
		.trim()
		.toLowerCase()
		.split(' ')
		.join('-')
		.split('(')
		.join('')
		.split(')')
		.join('')
		.split("'")
		.join('')
		.split('’')
		.join('')}`
}

/**
 * @param {string} symbol Asset symbol
 * @param {boolean} hd Return HD icon if true
 * @returns {string} URL to the asset icon
 */
export function liquidationsIconUrl(symbol, hd = false) {
	if (hd) {
		return `${ICONS_CDN}/liquidations/${symbol.toLowerCase()}?w=64&h=64`
	} else {
		return `${ICONS_CDN}/liquidations/${symbol.toLowerCase()}?w=48&h=48`
	}
}

export function liquidationsIconPaletteUrl(symbol) {
	return `${ICONS_PALETTE_CDN}/protocols/${symbol.toLowerCase()}`
}

export function peggedAssetIconUrl(name) {
	return `${ICONS_CDN}/pegged/${encodeURIComponent(name.toLowerCase().split(' ').join('-'))}?w=48&h=48`
}

export function peggedAssetIconPalleteUrl(name) {
	return `${ICONS_PALETTE_CDN}/pegged/${encodeURIComponent(name.toLowerCase().split(' ').join('-'))}`
}

export function formattedPercent(percent, noSign = false, fontWeight = 400, returnTextOnly) {
	if (!percent && percent !== 0) {
		return null
	}

	let up = 'green'
	let down = 'red'

	if (noSign) {
		up = down = ''
	}

	let color = ''
	let finalValue = ''

	percent = parseFloat(percent)

	if (!percent || percent === 0) {
		finalValue = '0%'
	} else if (percent < 0.0001 && percent > 0) {
		color = up
		finalValue = '< 0.0001%'
	} else if (percent < 0 && percent > -0.0001) {
		color = down
		finalValue = '< 0.0001%'
	} else {
		let fixedPercent = percent.toFixed(2)

		if (fixedPercent === '0.00') {
			finalValue = '0%'
		} else if (fixedPercent > 0) {
			const prefix = noSign ? '' : '+'

			if (fixedPercent > 100) {
				color = up
				finalValue = `${prefix}${percent.toFixed(0).toLocaleString()}%`
			} else {
				color = up
				finalValue = `${prefix}${fixedPercent}%`
			}
		} else {
			color = down
			finalValue = `${fixedPercent}%`
		}
	}

	if (returnTextOnly) {
		return finalValue
	}

	if (fontWeight > 400) {
		return (
			<span
				className={`${noSign ? '' : color === 'green' ? 'text-[var(--pct-green)]' : 'text-[var(--pct-red)]'}`}
				style={{ fontWeight }}
			>
				{finalValue}
			</span>
		)
	}

	return (
		<span className={`${noSign ? '' : color === 'green' ? 'text-[var(--pct-green)]' : 'text-[var(--pct-red)]'}`}>
			{finalValue}
		</span>
	)
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
	const adjustedPercentChange =
		((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
	if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
		return null
	}
	return adjustedPercentChange
}

export const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1)

export const slug = (name = '') => name?.toLowerCase().split(' ').join('-').split("'").join('')

export function getRandomColor() {
	var letters = '0123456789ABCDEF'
	var color = '#'
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

export function selectColor(number, color) {
	const hue = number * 137.508 // use golden angle approximation

	const { h, s, l, a } = colord(color).toHsl()

	return colord({
		h: h + hue,
		s: number !== 0 && l < 70 ? 70 : s,
		l: number !== 0 && l < 60 ? 60 : l,
		a: number !== 0 && a < 0.6 ? 1 : a
	}).toHex()
}

export const getColorFromNumber = (index, length) => {
	//use defillama blue as starting
	return colord({
		l: 48.792 + (index / (length + 1)) * 30,
		c: 67 + (index / (length + 1)) * 20,
		h: 278.2 + (index / (length + 1)) * 360
	}).toHex()
}

export const getDominancePercent = (value, total) => {
	if (!value || !total) {
		return 0
	}

	const ratio = total > 0 ? value / total : 0

	return Number((ratio * 100).toFixed(2))
}

export const getTokenDominance = (topToken, totalVolume) => {
	const dominance = topToken.tvl && totalVolume && (topToken.tvl / totalVolume) * 100.0
	if (!dominance) return null
	if (dominance < 100) {
		return dominance.toFixed(2)
	} else return 100
}

/**
 * get tvl of specified day before last day using chart data
 * @param {*} chartData
 * @param {*} daysBefore
 */
export const getPrevTvlFromChart = (chart, daysBefore) => {
	return chart[chart.length - 1 - daysBefore]?.[1] ?? null
}

export const getPrevTvlFromChart2 = (chart, daysBefore, key) => {
	return chart[chart.length - 1 - daysBefore]?.[key] ?? null
}

export const getPrevVolumeFromChart = (chart, daysBefore, txs = false, inflows = false) => {
	if (!chart) return null
	const prevChart = chart[chart.length - 1 - daysBefore]
	if (!prevChart) return null
	if (inflows) {
		return prevChart.Deposits - prevChart.Withdrawals
	}
	return txs ? prevChart.txs : prevChart.volume
}

export function download(filename, text) {
	var element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename)

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)
}

export const formatPercentage = (value) => {
	let zeroes = 0
	let stop = false

	value
		.toString()
		.split('.')?.[1]
		?.slice(0, 5)
		?.split('')
		?.forEach((x) => {
			if (!stop && x == '0') {
				zeroes += 1
			} else {
				stop = true
			}
		})

	return value.toLocaleString(undefined, { maximumFractionDigits: zeroes + 1 })
}

export function iterateAndRemoveUndefined(obj) {
	if (typeof obj !== 'object') return obj
	if (Array.isArray(obj)) return obj
	Object.entries(obj).forEach((key, value) => {
		if (value === undefined) delete obj[key]
		else iterateAndRemoveUndefined(value)
	})
	return obj
}

export function nearestUtcZeroHour(dateString) {
	const date = new Date(dateString)

	if (date.getHours() >= 12) {
		date.setDate(date.getDate() + 1)
	}

	const now = new Date()
	return Date.now() < date.getTime()
		? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
		: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function firstDayOfMonth(dateString) {
	const date = new Date(dateString)
	return Math.trunc(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / 1000)
}

export function lastDayOfWeek(dateString) {
	const date = new Date(dateString)
	const weekDay = date.getUTCDay() === 0 ? 7 : date.getUTCDay()
	const lastDayOfWeek = date.getUTCDate() - weekDay
	return Math.trunc(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), lastDayOfWeek) / 1000)
}
