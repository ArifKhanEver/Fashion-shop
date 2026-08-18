"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AdminRevenueChartProps {
  data: { name: string; total: number }[];
  /** Pass additional datasets for the 14/30 day view toggler */
  data14?: { name: string; total: number }[];
  data30?: { name: string; total: number }[];
}

const RANGES = [
  { label: "7 Days", key: "7" },
  { label: "14 Days", key: "14" },
  { label: "30 Days", key: "30" },
];

export default function AdminRevenueChart({ data, data14, data30 }: AdminRevenueChartProps) {
  const [range, setRange] = useState("7");

  const activeData =
    range === "30" && data30
      ? data30
      : range === "14" && data14
      ? data14
      : data;

  // Use a bar chart for 7 days, line chart for longer ranges (more data points)
  const useLine = range !== "7";

  return (
    <div className="flex flex-col h-full">
      {/* Range selector */}
      {(data14 || data30) && (
        <div className="flex items-center gap-1 mb-4">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                range === r.key
                  ? "bg-[#E91E8C] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {useLine ? (
            <LineChart data={activeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ stroke: "#E91E8C", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
                  fontSize: "13px",
                }}
                formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#E91E8C"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#E91E8C" }}
              />
            </LineChart>
          ) : (
            <BarChart data={activeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip
                cursor={{ fill: "#fdf2f8" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
                }}
                formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="total" fill="#E91E8C" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
