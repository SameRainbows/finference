"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { marginSeries } from "@/lib/demo-data";

export function MarginChart({ protectedMode }: { protectedMode: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={marginSeries} margin={{ left: -24, right: 8, top: 12 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9ff3f" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#c9ff3f" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#55e8cf" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#55e8cf" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,.24)", fontSize: 10 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ stroke: "rgba(255,255,255,.15)", strokeDasharray: "4 4" }}
          contentStyle={{
            borderRadius: 12,
            background: "#11171a",
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 18px 60px rgba(0,0,0,.35)",
            color: "white",
            fontSize: 11,
          }}
          formatter={(value, name) => [
            `$${Number(value).toLocaleString()}`,
            name === "revenue"
              ? "Revenue"
              : protectedMode
                ? "Protected cost"
                : "Model cost",
          ]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#c9ff3f"
          fill="url(#revenueFill)"
          strokeWidth={2}
          activeDot={{ r: 4, fill: "#c9ff3f", strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey={protectedMode ? "protected" : "cost"}
          stroke="#55e8cf"
          fill="url(#costFill)"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          activeDot={{ r: 3, fill: "#55e8cf", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

