import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Layout from '~/layout'
import { RowLinksWithDropdown } from '~/components/RowLinksWithDropdown'
import { formatChartTvlsByDay } from '~/hooks/data'
import { formattedNum, getPrevTvlFromChart2, getTokenDominance } from '~/utils'
import { maxAgeForNext } from '~/api'
import { formatDataWithExtraTvls } from '~/hooks/data/defi'
import { useLocalStorageSettingsManager } from '~/contexts/LocalStorage'
import { withPerformanceLogging } from '~/utils/perf'
import { ProtocolsTableWithSearch } from '~/components/Table/Defi/Protocols'
import { getOraclePageData } from '~/containers/Oracles/queries'
import { ProtocolsChainsSearch } from '~/components/Search/ProtocolsChains'

const Chart = dynamic(() => import('~/components/ECharts/AreaChart2'), {
	ssr: false,
	loading: () => <></>
})
const charts = ['TVS']

const chartColors = {
	TVS: '#1f67d2'
}

export const getStaticProps = withPerformanceLogging(
	'oracles/[...oracle]',
	async ({
		params: {
			oracle: [oracle, chain]
		}
	}) => {
		const data = await getOraclePageData(oracle, chain)

		if (!data) {
			return { notFound: true }
		}

		return {
			props: { ...data },
			revalidate: maxAgeForNext([22])
		}
	}
)

export async function getStaticPaths() {
	const { oracles = {} } = await getOraclePageData()

	const oraclesList = Object.keys(oracles)

	const paths = oraclesList.slice(0, 10).map((oracle) => {
		return {
			params: { oracle }
		}
	})

	return { paths, fallback: 'blocking' }
}

const PageView = ({ chartData, tokenLinks, token, filteredProtocols, chain, chainChartData, oracleMonthlyVolumes }) => {
	const [extraTvlsEnabled] = useLocalStorageSettingsManager('tvl')
	const { protocolsData, finalChartData, totalValue } = useMemo(() => {
		const protocolsData = formatDataWithExtraTvls({
			data: filteredProtocols,
			extraTvlsEnabled
		})

		const finalChartData = formatChartTvlsByDay({ data: chainChartData || chartData, extraTvlsEnabled, key: 'TVS' })

		const totalValue = getPrevTvlFromChart2(finalChartData, 0, 'TVS')

		return { protocolsData, finalChartData, totalValue }
	}, [chainChartData, chartData, extraTvlsEnabled, filteredProtocols])

	const topToken = {}

	if (protocolsData.length > 0) {
		topToken.name = protocolsData[0]?.name
		topToken.tvl = protocolsData[0]?.tvl
	}

	const dominance = getTokenDominance(topToken, totalValue)

	return (
		<>
			<ProtocolsChainsSearch />

			<RowLinksWithDropdown links={tokenLinks} activeLink={chain ?? 'All'} />

			<div className="grid grid-cols-2 relative isolate xl:grid-cols-3 gap-1">
				<div className="bg-[var(--cards-bg)] rounded-md flex flex-col gap-6 p-5 col-span-2 w-full xl:col-span-1 overflow-x-auto">
					<h1 className="text-xl font-semibold">{token}</h1>
					<p className="flex flex-col">
						<span className="text-[#545757] dark:text-[#cccccc]">Total Value Secured (USD)</span>
						<span className="font-semibold text-2xl font-jetbrains">{formattedNum(totalValue, true)}</span>
					</p>
					<p className="flex flex-col">
						<span className="text-[#545757] dark:text-[#cccccc]">Total Perp DEX Volume Secured (30d)</span>
						<span className="font-semibold text-2xl font-jetbrains">
							{formattedNum(oracleMonthlyVolumes[token] ?? 0, true)}
						</span>
					</p>
					<p className="flex flex-col">
						<span className="text-[#545757] dark:text-[#cccccc]">{topToken.name} Dominance</span>
						<span className="font-semibold text-2xl font-jetbrains">{dominance}%</span>
					</p>
				</div>

				<div className="bg-[var(--cards-bg)] rounded-md flex flex-col pt-3 col-span-2 min-h-[372px]">
					<Chart chartData={finalChartData} stackColors={chartColors} stacks={charts} title="" valueSymbol="$" />
				</div>
			</div>

			<ProtocolsTableWithSearch data={protocolsData} />
		</>
	)
}

export default function Oracles(props) {
	return (
		<Layout title={`Oracles - DefiLlama`} defaultSEO>
			<PageView {...props} />
		</Layout>
	)
}
