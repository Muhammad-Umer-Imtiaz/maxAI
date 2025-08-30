'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A bar chart with a label'

const chartData = [
  { day: 'Monday', calories: 2150 },
  { day: 'Tuesday', calories: 1980 },
  { day: 'Wednesday', calories: 2340 },
  { day: 'Thursday', calories: 2100 },
  { day: 'Friday', calories: 2450 },
  { day: 'Saturday', calories: 2680 },
  { day: 'Sunday', calories: 2200 },
]

const chartConfig = {
  calories: {
    label: 'Calories',
    color: '#ffffff', // white bars
  },
} satisfies ChartConfig

export function ChartBarLabel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Weekly Calories Chart</CardTitle>
        <CardDescription className="text-muted-foreground">
          Daily calorie intake for this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            {/* White grid lines */}
            <CartesianGrid vertical={false} stroke="#ffffff33" />

            {/* White X-axis */}
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: '#ffffff' }} // white text
              tickFormatter={(value) => value.slice(0, 3)}
            />

            {/* Tooltip with white theme */}
            <ChartTooltip
              cursor={{ fill: '#ffffff11' }}
              content={<ChartTooltipContent className="bg-white text-black" hideLabel />}
            />

            {/* White bars */}
            <Bar dataKey="calories" fill="#ffffff" radius={8}>
              <LabelList position="top" offset={12} className="fill-white" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-foreground">
          Average 2,271 calories per day <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing daily calorie intake for the current week
        </div>
      </CardFooter>
    </Card>
  )
}
