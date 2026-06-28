"use client";
 
import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/loading-spinner";
// import { Skeleton } from "@/components/ui/skeleton";
 
interface sessionContents {
  _id: string;
  userId: string;
  firebaseUid: string;
  ipAddress: string;
  isCurrent: boolean;
  browser: string;
  os: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  loginTime?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
  };
  status?: "success" | "failed" | "pending" | "blocked" | "logged_out";
  otpVerified?: boolean;
  loginMethod?: "google" | "email";
  blocked?: boolean;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}
 
function DeviceIcon({
  type,
  size = 16,
}: {
  type: "desktop" | "mobile" | "tablet" | "unknown";
  size?: number;
}) {
  if (type === "mobile") return <Smartphone size={size} />;
  if (type === "tablet") return <Laptop size={size} />;
  return <Monitor size={size} />;
}
 
// function SessionCardSkeleton() {
//   return (
//     <div className="rounded-xl border border-white/[0.07] bg-[#1a1f2e] p-4">
//       <div className="flex items-start gap-3">
//         <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
//         <div className="flex-1 space-y-2">
//           <Skeleton className="h-4 w-40 bg-white/5" />
//           <Skeleton className="h-3 w-56 bg-white/5" />
//           <Skeleton className="h-3 w-32 bg-white/5" />
//         </div>
//       </div>
//     </div>
//   );
// }
 
function SessionCard({
  session,
  onLogout,
  isLoggingOut,
}: {
  session: sessionContents;
  onLogout: (id: string) => void;
  isLoggingOut: boolean;
}) {
  if (!session || typeof session !== "object" || Array.isArray(session))
    return null;
 
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        session.isCurrent
          ? "bg-blue-500/5 border-blue-500/20"
          : session.blocked || session.status === "blocked"
            ? "bg-red-500/5 border-red-500/15"
            : session.status === "logged_out"
              ? "bg-white/[0.02] border-white/[0.05] opacity-60"
              : "bg-[#1a1f2e] border-white/[0.07] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 shrink-0 rounded-lg p-2 ${
              session.isCurrent
                ? "bg-blue-500/15 text-blue-400"
                : session.blocked || session.status === "blocked"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-white/5 text-gray-400"
            }`}
          >
            <DeviceIcon type={session.deviceType} size={18} />
          </div>
 
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-white">
                {session.browser} · {session.os}
              </span>
              {session.isCurrent && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 border-blue-500/30 text-blue-400 bg-blue-500/10"
                >
                  Current
                </Badge>
              )}
              {(session.blocked || session.status === "blocked") && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 border-red-500/30 text-red-400 bg-red-500/10"
                >
                  Blocked
                </Badge>
              )}
              {session.status === "logged_out" && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 border-white/10 text-gray-500 bg-white/5"
                >
                  Logged out
                </Badge>
              )}
              {session.loginMethod && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 border-white/10 text-gray-500 bg-white/5 capitalize"
                >
                  {session.loginMethod}
                </Badge>
              )}
            </div>
 
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={11} />
                <span>
                  {session?.location?.city ??
                    session?.location?.country ??
                    "Unknown location"}
                </span>
                <span className="text-gray-700">·</span>
                <span className="font-mono">{session.ipAddress}</span>
              </div>
              {session.loginTime && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={11} />
                  <span>
                    {new Date(session.loginTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {(session.blocked || session.status === "blocked") &&
                session.blockedReason && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                    <AlertTriangle size={11} />
                    <span>{session.blockedReason}</span>
                  </div>
                )}
              {!session.blocked && session.status !== "blocked" && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {session.otpVerified ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Verified by OTP</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={11} className="text-gray-600" />
                      <span className="text-gray-600">No OTP required</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* Logout button — only for non-current, active sessions */}
        {!session.isCurrent &&
          !session.blocked &&
          session.status !== "blocked" &&
          session.status !== "logged_out" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoggingOut}
                  className="shrink-0 h-7 px-2.5 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={13} className="mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>End this session?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will immediately log out the{" "}
                    <span className="text-white">
                      {session.browser} on {session.os}
                    </span>{" "}
                    session{session?.location?.city ? ` from ${session.location.city}` : ""}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onLogout(session._id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    End session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
      </div>
    </div>
  );
}
 
function PaginationBar({
  pagination,
  page,
  onPageChange,
}: {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  page: number;
  onPageChange: (p: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;
 
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-gray-500">
        Showing {(page - 1) * pagination.limit + 1}–
        {Math.min(page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} sessions
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={!pagination.hasPrev}
          onClick={() => onPageChange(page - 1)}
          className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs text-gray-500 tabular-nums px-1">
          {page} / {pagination.totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!pagination.hasNext}
          onClick={() => onPageChange(page + 1)}
          className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
 
export default function SessionsPage() {
  const {
    fetchSession,
    sessionData,
    pagination,
    page,
    user,
    isLoading,
    logout,
    logoutAll,
    logoutOthers,
  } = useAuth();
 
  const [loggingOutId, setLoggingOutId] = useState<string | null>(null);
  const [logoutOthersLoading, setLogoutOthersLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
 
  useEffect(() => {
    if (!user?._id) return;
    fetchSession(1);
  }, [user]);

  console.log(sessionData)
 
  const sessions = (sessionData as sessionContents[]) ?? [];
  const currentSession = sessions.find((s) => s.isCurrent);
  const otherActiveSessions = sessions.filter(
    (s) => !s.isCurrent && s.status !== "logged_out"
  );
  const historySessions = sessions.filter(
    (s) => !s.isCurrent && s.status === "logged_out"
  );
 
  const activeCount = sessions.filter(
    (s) => s.status !== "logged_out" && s.status !== "blocked"
  ).length;
  const blockedCount = sessions.filter(
    (s) => s.blocked || s.status === "blocked"
  ).length;
  const otpCount = sessions.filter((s) => s.otpVerified).length;
  const deviceTypes = new Set(sessions.map((s) => s.deviceType));
 
  const handleLogoutSession = async (id: string) => {
    setLoggingOutId(id);
    try {
      await fetchSession(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOutId(null);
    }
  };
 
  const handleLogoutOthers = async () => {
    setLogoutOthersLoading(true);
    try {
      await logoutOthers();
      await fetchSession(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLogoutOthersLoading(false);
    }
  };
 
  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await logoutAll();
    } catch (err) {
      console.error(err);
      setLogoutAllLoading(false);
    }
  };
 
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSession(page);
    } finally {
      setRefreshing(false);
    }
  };
 
  const handlePageChange = (p: number) => {
    fetchSession(p);
  };
 
  const STATS = [
    {
      label: "Devices",
      value: deviceTypes.size,
      icon: Monitor,
      color: "text-blue-400",
    },
    {
      label: "Active",
      value: activeCount,
      icon: Wifi,
      color: "text-purple-400",
    },
    {
      label: "OTP logins",
      value: otpCount,
      icon: KeyRound,
      color: "text-emerald-400",
    },
    {
      label: "Blocked",
      value: blockedCount,
      icon: Ban,
      color: "text-red-400",
    },
  ];
 
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* ── Header ── */}
        <div className="mb-6 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-blue-400" />
              <h1 className="text-lg font-semibold text-white">Security</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="h-7 px-2.5 text-xs text-gray-500 hover:text-white hover:bg-white/5"
            >
              <RefreshCw
                size={13}
                className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Monitor login activity and manage active sessions.
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
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <span className="text-2xl font-semibold text-white tabular-nums">
                    {stat.value}
                  </span>
                )}
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
            Current device
          </h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : currentSession ? (
            <SessionCard
              session={currentSession}
              onLogout={handleLogoutSession}
              isLoggingOut={loggingOutId === currentSession._id}
            />
          ) : (
            <p className="text-sm text-gray-600 italic">No active session found.</p>
          )}
        </section>
 
        {/* ── Other Active Sessions ── */}
        {(otherActiveSessions.length > 0 || isLoading) && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other sessions
                {otherActiveSessions.length > 0 && (
                  <span className="ml-1.5 text-gray-600">
                    ({otherActiveSessions.length})
                  </span>
                )}
              </h2>
              {otherActiveSessions.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={logoutOthersLoading}
                      className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut size={12} className="mr-1" />
                      {logoutOthersLoading ? "Logging out…" : "Logout others"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Logout all other sessions?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This ends{" "}
                        <span className="text-white font-medium">
                          {otherActiveSessions.length} other session
                          {otherActiveSessions.length !== 1 ? "s" : ""}
                        </span>{" "}
                        immediately. Your current session stays active.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogoutOthers}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                      >
                        Logout others
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="space-y-2">
              {isLoading ? 
              <LoadingSpinner />
                : otherActiveSessions.map((s) => (
                    <SessionCard
                      key={s._id}
                      session={s}
                      onLogout={handleLogoutSession}
                      isLoggingOut={loggingOutId === s._id}
                    />
                  ))}
                  <LoadingSpinner />
            </div>
          </section>
        )}
 
        {/* ── Session History ── */}
        {historySessions.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Session history
            </h2>
            <div className="space-y-2">
              {historySessions.map((s) => (
                <SessionCard
                  key={s._id}
                  session={s}
                  onLogout={handleLogoutSession}
                  isLoggingOut={loggingOutId === s._id}
                />
              ))}
            </div>
            <PaginationBar
              pagination={pagination}
              page={page}
              onPageChange={handlePageChange}
            />
          </section>
        )}
 
        {/* ── Danger Zone ── */}
        <section>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-red-500/15 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="text-sm font-medium text-red-300">Danger zone</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Log out everywhere</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ends all sessions across every device immediately.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={logoutAllLoading}
                      className="shrink-0 h-7 px-3 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut size={13} className="mr-1.5" />
                      {logoutAllLoading ? "Logging out…" : "Logout all"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Log out everywhere?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This immediately ends all active sessions on every
                        device, including this one. You will need to log in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogoutAll}
                        className="bg-red-600 text-white hover:bg-red-700 border-0"
                      >
                        Log out everywhere
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}