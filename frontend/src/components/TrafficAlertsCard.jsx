import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const SEVERITY_CONFIG = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    badge: 'bg-red-500',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: '🔴',
    label: 'High',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    badge: 'bg-amber-500',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    icon: '🟡',
    label: 'Medium',
  },
  low: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-500',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: '🟢',
    label: 'Low',
  },
};

const TYPE_ICONS = {
  accident: '💥',
  construction: '🚧',
  closure: '🚫',
  congestion: '🚗',
  weather: '🌧️',
  event: '🎉',
  default: '⚠️',
};

function AlertItem({ alert, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
  const typeIcon = TYPE_ICONS[alert.type] || TYPE_ICONS.default;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        {/* Pulsing dot for high severity */}
        <span className="relative flex-shrink-0">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot}`}></span>
          {alert.severity === 'high' && (
            <span className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${cfg.dot} animate-ping opacity-75`}></span>
          )}
        </span>

        <span className="text-lg">{typeIcon}</span>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${cfg.text} truncate`}>{alert.title}</p>
          <p className="text-xs text-gray-500 truncate">{alert.location}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs text-white px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-dashed border-gray-200 space-y-1.5">
              <p className="text-sm text-gray-700">{alert.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                {alert.delay_impact && (
                  <span>⏱ Extra delay: <strong className="text-rose-600">+{alert.delay_impact} min</strong></span>
                )}
                {alert.reported_at && (
                  <span>🕐 Reported: {alert.reported_at}</span>
                )}
                {alert.source && (
                  <span>📡 Source: {alert.source}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TrafficAlertsCard({ alerts, loading, source, destination }) {
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Don't render if no route has been searched yet
  if (!source && !destination) return null;

  const filteredAlerts =
    filterSeverity === 'all'
      ? alerts
      : alerts?.filter((a) => a.severity === filterSeverity);

  const highCount = alerts?.filter((a) => a.severity === 'high').length || 0;
  const medCount = alerts?.filter((a) => a.severity === 'medium').length || 0;
  const lowCount = alerts?.filter((a) => a.severity === 'low').length || 0;
  const totalCount = alerts?.length || 0;

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-8 bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-xl border border-indigo-200 ring-1 ring-purple-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-indigo-700 tracking-wide">
            🚨 Traffic Alerts
          </h3>
          {totalCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {totalCount} active
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {source} → {destination}
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-indigo-500">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium animate-pulse">Scanning route for incidents...</span>
        </div>
      )}

      {/* No Alerts State */}
      {!loading && (!alerts || alerts.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-8 gap-2"
        >
          <span className="text-4xl">✅</span>
          <p className="text-green-600 font-semibold text-sm">Route looks clear!</p>
          <p className="text-gray-400 text-xs">No active incidents detected on this route</p>
        </motion.div>
      )}

      {/* Alerts Available */}
      {!loading && alerts && alerts.length > 0 && (
        <>
          {/* Summary pills */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'all', label: `All (${totalCount})`, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
              { key: 'high', label: `🔴 High (${highCount})`, color: 'bg-red-100 text-red-700 border-red-300' },
              { key: 'medium', label: `🟡 Medium (${medCount})`, color: 'bg-amber-100 text-amber-700 border-amber-300' },
              { key: 'low', label: `🟢 Low (${lowCount})`, color: 'bg-green-100 text-green-700 border-green-300' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterSeverity(f.key)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-all duration-200 ${f.color} ${
                  filterSeverity === f.key ? 'ring-2 ring-offset-1 ring-indigo-400 shadow-md' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert items */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredAlerts && filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, i) => (
                  <AlertItem key={alert.id || i} alert={alert} index={i} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-400 py-4"
                >
                  No {filterSeverity} severity alerts
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Total delay impact */}
          {alerts.some((a) => a.delay_impact) && (
            <div className="mt-4 pt-3 border-t border-dashed border-indigo-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total incident delay impact:</span>
              <span className="text-rose-600 font-bold text-sm">
                +{alerts.reduce((sum, a) => sum + (a.delay_impact || 0), 0)} min
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
