import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  BarChart3, 
  Calendar,
  Layers,
  Activity,
  Filter,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { scanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HistoryScreen({ onScanNew, onSelectHistoricalScan }) {
  const { isLoggedIn } = useAuth();
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'diseased' | 'healthy'

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [scanList, statData] = await Promise.all([
        scanAPI.getScans(),
        scanAPI.getStats()
      ]);
      setScans(scanList || []);
      setStats(statData || null);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this scan record from history?')) {
      await scanAPI.deleteScan(id);
      fetchHistory();
    }
  };

  const chartColors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  const filteredScans = scans.filter(s => {
    if (filter === 'healthy') return s.isHealthy;
    if (filter === 'diseased') return !s.isHealthy;
    return true;
  });

  const healthyCount = stats?.healthyCount ?? scans.filter(s => s.isHealthy).length;
  const diseasedCount = stats?.diseasedCount ?? scans.filter(s => !s.isHealthy).length;
  const totalCount = scans.length;
  const healthyPercentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-black mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Field Analytics & History</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Crop Health Archive
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLoggedIn ? 'Cloud Synced across all your agronomy devices' : 'Stored locally in Guest Mode (Login to sync to cloud)'}
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-3 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition shadow-sm"
          title="Refresh History"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Analytics Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-slate-400">Total Scans Recorded</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
            {isLoggedIn ? 'Logged in account' : 'Local browser archive'}
          </span>
        </div>

        <div className="glass-card-neo rounded-3xl p-5 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400">Healthy Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {healthyPercentage}%
          </p>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-1 block">
            {healthyCount} Healthy Leaves
          </span>
        </div>

        <div className="glass-card-neo rounded-3xl p-5 border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-rose-600 dark:text-rose-400">Infection Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalCount > 0 ? Math.round((diseasedCount / totalCount) * 100) : 0}%
          </p>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-semibold mt-1 block">
            {diseasedCount} Pathogen Cases
          </span>
        </div>
      </div>

      {/* Disease Distribution Chart */}
      {scans.length > 0 && stats?.diseaseBreakdown?.length > 0 && (
        <div className="glass-card-neo rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Pathogen Frequency Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Neural Aggregation</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.diseaseBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  interval={0} 
                  angle={-22} 
                  textAnchor="end" 
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#091e24', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '16px', fontSize: '11px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.diseaseBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Tabs & History List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Past Diagnoses ({filteredScans.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass-card text-[11px] font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilter('diseased')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'diseased'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Diseased ({diseasedCount})
            </button>
            <button
              onClick={() => setFilter('healthy')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'healthy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Healthy ({healthyCount})
            </button>
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="glass-card-neo rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700/80">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3.5">
              <Camera className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              No scan records found in this category
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              Perform an instant AI scan of a Broccoli, Cabbage, Cauliflower, or Turnip leaf to populate this archive.
            </p>
            <button
              onClick={onScanNew}
              className="mt-5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 transition"
            >
              Scan New Leaf Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScans.map((scan) => {
              const scanId = scan._id || scan.id;
              const dateStr = new Date(scan.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={scanId}
                  onClick={() => onSelectHistoricalScan && onSelectHistoricalScan(scan)}
                  className="glass-card-neo rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3.5 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-inner">
                      {scan.thumbnail ? (
                        <img src={scan.thumbnail} alt={scan.disease} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-400 font-black text-base">
                          {scan.vegetable?.[0] || 'L'}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {scan.disease}
                        </h4>
                        {scan.isHealthy ? (
                          <span className="p-1 rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-full bg-rose-500/15 text-rose-500 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{scan.vegetable}</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{scan.confidence}% confidence</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(scanId, e)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                    title="Delete Scan Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
