"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,     
} from "@/components/ui/chart";

interface OverallScoreChartProps {
  overallScore: number;
}

export default function OverallScoreChart({ overallScore }: OverallScoreChartProps) {
  const pieChartData = [
    {
      name: "Risks",
      value: 100 - overallScore,
      fill: "#ef4444", // Tailwind red-500
    },
    {
      name: "Opportunities",
      value: overallScore,
      fill: "#0d9488", // Tailwind teal-600
    },
  ];

  const chartConfig = {
    value: {
      label: "Value",
    },
    Risks: {
      label: "Risks",
      color: "#ef4444", // Matches red-500
    },
    Opportunities: {
      label: "Opportunities",
      color: "#0d9488", // Matches teal-600
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-48">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            paddingAngle={3}
            stroke="#e5e7eb" // Tailwind gray-200
            strokeWidth={1}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-800 text-lg font-semibold"
                    >
                      <tspan x={viewBox.cx} dy="-0.6em">
                        {overallScore}%
                      </tspan>
                      <tspan x={viewBox.cx} dy="1.2em" className="text-sm font-medium fill-gray-600">
                        Score
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}