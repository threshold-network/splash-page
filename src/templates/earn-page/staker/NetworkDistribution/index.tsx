import Card from "../../../../components/Card"
import React, { useCallback, useEffect, useRef, useState } from "react"
import type { ChartArea, ChartData } from "chart.js"
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js"
import numeral from "numeral"
import BigNumber from "bignumber.js"
import { formatEther } from "ethers/lib/utils"
import useFetchStakedT from "../../../../hooks/useFetchStakedT"
import TStakedChart from "./TStakedChart"
import { Stack } from "@chakra-ui/react"
import { H2, H5, LabelMd } from "../../../../components"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

type Filter = "Week" | "Month" | "Year"

function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
  const colorStart = "#52545a"
  const colorEnd = "#1D2229"
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom)
  gradient.addColorStop(0, colorStart)
  gradient.addColorStop(1, colorEnd)
  return gradient
}

const options = {
  plugins: {
    legend: { display: false },
  },
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        fontColor: "white",
        padding: 20,
        // @ts-ignore
        callback: function (val, index, tick) {
          // only show label for first and last of the data set
          if (index === 0 || index === tick.length - 1) {
            // @ts-ignore
            return this.getLabelForValue(val)
          }

          return ""
        },
      },
    },
    y: {
      ticks: {
        fontColor: "white",
        maxTicksLimit: 5,
        padding: 20,
        callback: (value: string | number) => {
          return numeral(value).format("0a")
        },
      },
      grid: {
        borderDash: [18, 18],
        borderDashOffset: 18,
        color: function (context: any) {
          // removes the bottom horizontal line - may be needed if gradient cannot be transparent
          // if (context.index === 0) {
          //   return undefined
          // }
          return "#718096" //gray.500"
        },
      },
    },
  },
}

function NetworkDistribution() {
  const chartRef = useRef<ChartJS>(null)
  const [filter, setFilter] = useState<Filter>("Year")
  const [isLoading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    datasets: [],
  })
  const { fetchWeeklyData, fetchMonthlyData, fetchYearlyData } =
    useFetchStakedT()

  const fetchAndUpdateChartData = useCallback(async () => {
    const chart = chartRef.current

    if (!chart) {
      return
    }

    setLoading(true)

    const dataFetcher =
      filter === "Week"
        ? fetchWeeklyData
        : filter === "Month"
        ? fetchMonthlyData
        : fetchYearlyData

    const data = await dataFetcher()

    const scrubbedData = Object.values(data).flatMap((datum) => {
      const { x: amountStaked, y: date } = datum[0] || {}
      const amountBn = new BigNumber(amountStaked)

      // TODO: investigate if this conversion is correct
      const amountToken = Math.floor(+formatEther(amountStaked || "0") / 1000)

      // flat map wil skip over this element, as the data is not valid
      if (isNaN(amountBn.toNumber())) {
        return []
      }

      return {
        y: amountToken.toString(),
        // TODO: pass different formatting option here based on the filter
        x: new Date(+date * 1000).toLocaleDateString("en-gb", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }),
      }
    })

    const dataWithConfig = {
      labels: [],
      datasets: [
        {
          // TODO: figure out why the ctx is null
          // backgroundColor: createGradient(chart.ctx, chart.chartArea),
          borderColor: "#9974FF",
          pointRadius: 0,
          fill: true,
          lineTension: 0.5,
          data: scrubbedData,
        },
      ],
    }

    // @ts-ignore
    setChartData(dataWithConfig)
    setLoading(false)
  }, [chartRef, filter])

  const changeFilter = (filter: Filter) => {
    if (!isLoading) {
      setFilter(filter)
    }
  }

  useEffect(() => {
    fetchAndUpdateChartData()
  }, [filter])

  return (
    <Card mt={8}>
      <Stack justifyContent="space-between" direction="row" mb={12}>
        <Stack spacing={4}>
          <LabelMd color="gray.500">Total Value Locked</LabelMd>
          <H2 color="gray.50">$2,400,000</H2>
        </Stack>
        <Stack spacing={4}>
          <LabelMd color="gray.500">Total Value Staked</LabelMd>
          <H2 color="gray.50">118,000,000 T</H2>
          <H5 color="gray.500">$15,300,000</H5>
        </Stack>
      </Stack>
      <TStakedChart />
    </Card>
  )
}

export default NetworkDistribution
