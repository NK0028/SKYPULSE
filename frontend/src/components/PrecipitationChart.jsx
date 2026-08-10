// ─────────────────────────────────────────────
//  PrecipitationChart — 5-day rain probability
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
  ReferenceLine
} from "recharts";
import { useWeatherContext } from "../context/WeatherContext";
import { formatDay } from "../utils/formatters";

const CustomBar = (props) => {
  const { x, y, width, height, value } = props;
  const color = value >= 80
    ? "#1d4ed8"
    : value >= 50
    ? "#3b82f6"
    : value >= 20
    ? "#93c5fd"
    : "#dbeafe";

  return (
    <g>
      <rect
        x={x} y={y}
        width={width}
        height={height}
        rx={4} ry={4}
        fill={color}
        fillOpacity={0.85}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const label = val >= 80 ? "Heavy" :
                val >= 50 ? "Moderate" :
                val >= 20 ? "Light" : "None";
  return (
    <div className={`
      px-3 py-2 rounded-xl text-xs font-medium
      ${isDark ? "glass text-white" : "glass-light text-slate-800"}
    `}>
      <p className="text-blue-400 font-bold">{val}%</p>
      <p className={
        isDark ? "text-white/50" : "text-slate-400"}>
        {label} rain
      </p>
    </div>
  );
};

const PrecipitationChart = () => {
  const { forecast, isDark } = useWeatherContext();
  if (!forecast?.daily?.length) return null;

  const data = forecast.daily.map((d, i) => ({
    day : i === 0 ? "Today" : formatDay(d.dt),
    pop : Math.round(d.pop * 100),
    date: new Date(d.dt * 1000).toLocaleDateString([],
      { month: "short", day: "numeric" }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-1
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📊 Rain Probability
      </h3>
      <p className={`text-xs mb-4
        ${isDark ? "text-white/30" : "text-slate-400"}`}>
        5-day precipitation forecast
      </p>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}
          barCategoryGap="25%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
              fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
              fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={35}
          />
          <ReferenceLine
            y={50} stroke="rgba(255,255,255,0.1)"
            strokeDasharray="4 4"
          />
          <Tooltip
            content={<CustomTooltip isDark={isDark} />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="pop" shape={<CustomBar />}
            radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {[
          { color: "#1d4ed8", label: "Heavy (80%+)"  },
          { color: "#3b82f6", label: "Moderate (50%+)" },
          { color: "#93c5fd", label: "Light (20%+)"  },
        ].map((l) => (
          <div key={l.label}
            className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm"
              style={{ background: l.color }} />
            <span className={`text-[10px]
              ${isDark ? "text-white/30" : "text-slate-400"}`}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PrecipitationChart;