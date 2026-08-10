// ─────────────────────────────────────────────
//  WeeklyPlanner — Best days for activities
// ─────────────────────────────────────────────

import { motion } from "framer-motion";
import { useWeatherContext } from "../context/WeatherContext";
import { formatDay } from "../utils/formatters";

const ACTIVITIES = [
  { id: "run",    emoji: "🏃", name: "Running"  },
  { id: "hike",   emoji: "🥾", name: "Hiking"   },
  { id: "cycle",  emoji: "🚴", name: "Cycling"  },
  { id: "picnic", emoji: "🧺", name: "Picnic"   },
  { id: "photo",  emoji: "📸", name: "Outdoor Photo" },
];

const rateDay = (dayData, activity) => {
  const temp = dayData.temp_max;
  const pop  = dayData.pop * 100;
  const cond = dayData.condition.toLowerCase();

  let score = 100;

  if (pop > 70)       score -= 40;
  else if (pop > 40)  score -= 20;

  if (cond.includes("thunder")) score -= 50;
  if (cond.includes("snow"))    score -= 30;

  switch (activity) {
    case "run":
      if (temp > 32) score -= 25;
      if (temp < 5)  score -= 25;
      if (temp >= 10 && temp <= 22) score += 15;
      break;
    case "hike":
      if (temp > 35) score -= 30;
      if (temp < 0)  score -= 30;
      if (temp >= 15 && temp <= 25) score += 10;
      break;
    case "cycle":
      if (temp > 35) score -= 20;
      if (pop > 30)  score -= 15;
      break;
    case "picnic":
      if (temp >= 20 && temp <= 28) score += 20;
      if (cond.includes("clear"))   score += 15;
      if (pop > 20)                 score -= 30;
      break;
    case "photo":
      if (cond.includes("clear"))   score += 20;
      if (cond.includes("cloud"))   score += 5;
      if (pop > 50)                 score -= 20;
      break;
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 75) return { score, color: "#34d399", label: "Great"  };
  if (score >= 50) return { score, color: "#60a5fa", label: "Good"   };
  if (score >= 25) return { score, color: "#fbbf24", label: "Fair"   };
  return               { score, color: "#ef4444",  label: "Poor"   };
};

const WeeklyPlanner = () => {
  const { forecast, isDark } = useWeatherContext();
  if (!forecast?.daily?.length) return null;

  const days = forecast.daily.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "glass" : "glass-light"} p-5`}
    >
      <h3 className={`text-sm font-semibold mb-4
        ${isDark ? "text-white/70" : "text-slate-600"}`}>
        📆 Weekly Activity Planner
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr>
              <th className={`text-left text-xs
                pb-3 pr-3 font-medium
                ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Activity
              </th>
              {days.map((d, i) => (
                <th key={i} className={`text-center
                  text-xs pb-3 px-1 font-medium
                  ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  {i === 0 ? "Today" : formatDay(d.dt)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES.map((act) => (
              <tr key={act.id}>
                <td className={`py-2 pr-3 text-sm
                  font-medium whitespace-nowrap
                  ${isDark ? "text-white/70" : "text-slate-600"}`}>
                  <span className="mr-2">{act.emoji}</span>
                  {act.name}
                </td>
                {days.map((d, i) => {
                  const rating = rateDay(d, act.id);
                  return (
                    <td key={i} className="py-2 px-1
                      text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-8 h-8 rounded-xl
                          flex items-center justify-center
                          mx-auto text-xs font-black"
                        style={{
                          background: `${rating.color}25`,
                          color     : rating.color,
                        }}
                        title={`${rating.label} (${rating.score})`}
                      >
                        {rating.score >= 75 ? "✓"
                          : rating.score >= 50 ? "~"
                          : "✗"}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[
          { color: "#34d399", label: "✓ Great"  },
          { color: "#60a5fa", label: "~ Good"   },
          { color: "#ef4444", label: "✗ Poor"   },
        ].map((l) => (
          <div key={l.label}
            className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-md"
              style={{ background: l.color }} />
            <span className={`text-xs
              ${isDark ? "text-white/30" : "text-slate-400"}`}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeeklyPlanner;