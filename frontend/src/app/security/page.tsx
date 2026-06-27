
"use client";
 
import { useState } from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  AlertTriangle,
  Wifi,
  KeyRound,
  Ban,
  ChevronRight,
  Trash2,
} from "lucide-react";
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
interface Session {
  id: string;
  isCurrent: boolean;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  location: string;
  ip: string;
  loggedIn: string;
  verified: boolean;
  blocked?: boolean;
  blockedReason?: string;
}
 
interface SecurityRule {
  id: string;
  device: string;
  badge: string;
  badgeColor: "blue" | "green" | "amber";
  icon: "monitor" | "globe" | "smartphone";
}
 
interface HistoryEntry {
  id: string;
  date: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet";
  status: "verified" | "blocked";
  blockedReason?: string;
}
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
 
const SESSIONS: Session[] = [
  {
    id: "1",
    isCurrent: true,
    browser: "Chrome",
    os: "Windows 11",
    deviceType: "desktop",
    location: "Ujjain, India",
    ip: "192.xxx.xxx.xxx",
    loggedIn: "Today 7:42 PM",
    verified: true,
  },
  {
    id: "2",
    isCurrent: false,
    browser: "Edge",
    os: "Windows 11",
    deviceType: "desktop",
    location: "Delhi, India",
    ip: "172.xxx.xxx.xxx",
    loggedIn: "Yesterday 10:14 AM",
    verified: false,
  },
  {
    id: "3",
    isCurrent: false,
    browser: "Safari",
    os: "iOS 17",
    deviceType: "mobile",
    location: "Mumbai, India",
    ip: "103.xxx.xxx.xxx",
    loggedIn: "Jun 24 3:00 PM",
    verified: true,
  },
  {
    id: "4",
    isCurrent: false,
    browser: "Firefox",
    os: "Android 14",
    deviceType: "mobile",
    location: "Bangalore, India",
    ip: "49.xxx.xxx.xxx",
    loggedIn: "Jun 22 9:10 AM",
    verified: false,
    blocked: true,
    blockedReason: "Outside allowed time",
  },
];
 
const RULES: SecurityRule[] = [
  { id: "1", device: "Chrome", badge: "OTP Required", badgeColor: "blue", icon: "monitor" },
  { id: "2", device: "Edge", badge: "Direct Login", badgeColor: "green", icon: "globe" },
  { id: "3", device: "Mobile", badge: "10 AM – 1 PM Only", badgeColor: "amber", icon: "smartphone" },
];
 
const HISTORY: HistoryEntry[] = [
  { id: "1", date: "Today", browser: "Chrome", deviceType: "desktop", status: "verified" },
  { id: "2", date: "Yesterday", browser: "Android", deviceType: "mobile", status: "blocked", blockedReason: "Outside Allowed Time" },
  { id: "3", date: "Jun 20", browser: "Edge", deviceType: "desktop", status: "verified" },
  { id: "4", date: "Jun 18", browser: "Safari", deviceType: "mobile", status: "verified" },
  { id: "5", date: "Jun 15", browser: "Chrome", deviceType: "desktop", status: "blocked", blockedReason: "Unrecognized IP" },
];
 
const STATS = [
  { label: "Devices", value: 4, icon: Monitor, color: "text-blue-400" },
  { label: "Sessions", value: 9, icon: Wifi, color: "text-purple-400" },
  { label: "OTP Logins", value: 7, icon: KeyRound, color: "text-emerald-400" },
  { label: "Blocked", value: 2, icon: Ban, color: "text-red-400" },
];
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
function DeviceIcon({ type, size = 16 }: { type: "desktop" | "mobile" | "tablet"; size?: number }) {
  if (type === "mobile") return <Smartphone size={size} />;
  if (type === "tablet") return <Laptop size={size} />;
  return <Monitor size={size} />;
}
 
function BadgePill({
  color,
  children,
}: {
  color: "blue" | "green" | "amber" | "red" | "gray";
  children: React.ReactNode;
}) {
  const map = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    gray: "bg-gray-700/50 text-gray-400 border-gray-600/30",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${map[color]}`}>
      {children}
    </span>
  );
}
 
function SessionCard({ session, onLogout }: { session: Session; onLogout: (id: string) => void }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        session.isCurrent
          ? "bg-blue-500/5 border-blue-500/20"
          : session.blocked
          ? "bg-red-500/5 border-red-500/15"
          : "bg-[#1a1f2e] border-white/[0.07] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* device icon */}
          <div
            className={`mt-0.5 shrink-0 rounded-lg p-2 ${
              session.isCurrent
                ? "bg-blue-500/15 text-blue-400"
                : session.blocked
                ? "bg-red-500/15 text-red-400"
                : "bg-white/5 text-gray-400"
            }`}
          >
            <DeviceIcon type={session.deviceType} size={18} />
          </div>
 
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-white">
                {session.browser} • {session.os}
              </span>
              {session.isCurrent && (
                <BadgePill color="blue">Current</BadgePill>
              )}
              {session.blocked && (
                <BadgePill color="red">Blocked</BadgePill>
              )}
            </div>
 
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={11} />
                <span>{session.location}</span>
                <span className="text-gray-700">·</span>
                <span className="font-mono">{session.ip}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={11} />
                <span>{session.loggedIn}</span>
              </div>
              {session.blocked && session.blockedReason && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                  <AlertTriangle size={11} />
                  <span>{session.blockedReason}</span>
                </div>
              )}
              {!session.blocked && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {session.verified ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Verified by OTP</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={11} className="text-gray-500" />
                      <span className="text-gray-500">No OTP required</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* logout button — only for non-current, non-blocked */}
        {!session.isCurrent && !session.blocked && (
          <button
            onClick={() => onLogout(session.id)}
            className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
 
function RuleCard({ rule }: { rule: SecurityRule }) {
  const IconMap = {
    monitor: Monitor,
    globe: Globe,
    smartphone: Smartphone,
  };
  const Icon = IconMap[rule.icon];
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#1a1f2e] px-4 py-3 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white/5 p-2 text-gray-400">
          <Icon size={16} />
        </div>
        <span className="text-sm text-gray-200">{rule.device}</span>
      </div>
      <BadgePill color={rule.badgeColor}>{rule.badge}</BadgePill>
    </div>
  );
}
 
function HistoryRow({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <div className="flex flex-col items-center gap-1 w-14 shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${
            entry.status === "verified" ? "bg-emerald-400" : "bg-red-400"
          }`}
        />
        <span className="text-[10px] text-gray-600 text-center leading-tight">{entry.date}</span>
      </div>
 
      <div className="flex items-center gap-2 text-gray-400">
        <DeviceIcon type={entry.deviceType} size={14} />
      </div>
 
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-300">{entry.browser}</span>
        {entry.status === "blocked" && entry.blockedReason && (
          <p className="text-[11px] text-red-400 mt-0.5">{entry.blockedReason}</p>
        )}
      </div>
 
      <BadgePill color={entry.status === "verified" ? "green" : "red"}>
        {entry.status === "verified" ? "Verified" : "Blocked"}
      </BadgePill>
    </div>
  );
}
 
// ─── Page ─────────────────────────────────────────────────────────────────────
 
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
 
  const currentSession = sessions.find((s) => s.isCurrent)!;
  const otherSessions = sessions.filter((s) => !s.isCurrent);
 
  const handleLogout = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };
 
  const handleLogoutAll = () => {
    setLogoutAllLoading(true);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setLogoutAllLoading(false);
    }, 800);
  };
 
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
 
        {/* ── Header ── */}
        <div className="mb-6 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Security</h1>
          </div>
          <p className="text-sm text-gray-500">
            Keep your account secure and monitor login activity.
          </p>
        </div>
 
        {/* ── Stats ── */}
        <section className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.07] bg-[#111827] px-4 py-3.5 flex flex-col gap-1"
              >
                <stat.icon size={15} className={stat.color} />
                <span className="text-2xl font-semibold text-white tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>
 
        {/* ── Current Device ── */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Current Device
          </h2>
          <SessionCard session={currentSession} onLogout={handleLogout} />
        </section>
 
        {/* ── Other Sessions ── */}
        {otherSessions.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other Sessions
              </h2>
              <button
                onClick={handleLogoutAll}
                disabled={logoutAllLoading}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <LogOut size={12} />
                {logoutAllLoading ? "Logging out…" : "Logout all"}
              </button>
            </div>
            <div className="space-y-2">
              {otherSessions.map((s) => (
                <SessionCard key={s.id} session={s} onLogout={handleLogout} />
              ))}
            </div>
          </section>
        )}
 
        {/* ── Security Rules ── */}
        <section className="mb-6">
          <div className="rounded-xl border border-white/[0.07] bg-[#111827] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
              <Shield size={15} className="text-blue-400" />
              <h2 className="text-sm font-medium text-white">Security Rules</h2>
            </div>
            <div className="p-3 space-y-2">
              {RULES.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          </div>
        </section>
 
        {/* ── Login History ── */}
        <section className="mb-6">
          <div className="rounded-xl border border-white/[0.07] bg-[#111827] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/[0.07]">
              <h2 className="text-sm font-medium text-white">Login History</h2>
            </div>
            <div className="px-4">
              {HISTORY.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </section>
 
        {/* ── Danger Zone ── */}
        <section>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-red-500/15 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="text-sm font-medium text-red-300">Danger Zone</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Log out everywhere</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ends all sessions across every device immediately.
                  </p>
                </div>
                <button className="shrink-0 flex items-center gap-1.5 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors">
                  <LogOut size={13} />
                  Logout all
                </button>
              </div>
              <div className="border-t border-red-500/10 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Delete account</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permanently removes your account and all data.
                  </p>
                </div>
                <button className="shrink-0 flex items-center gap-1.5 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors">
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>
 
      </div>
    </div>
  );
}