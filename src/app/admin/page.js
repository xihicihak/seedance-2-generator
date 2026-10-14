"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  FiUsers, 
  FiVideo, 
  FiDatabase, 
  FiCpu, 
  FiSearch, 
  FiPlus, 
  FiShield, 
  FiExternalLink, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock, 
  FiTrash2,
  FiZap,
  FiDollarSign,
  FiArrowLeft
} from "react-icons/fi";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [creationFilter, setCreationFilter] = useState("all");
  const [creationSearch, setCreationSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const isAdmin = 
    session?.user?.role === "ADMIN" || 
    session?.user?.email === "xihicihak43@gmail.com";

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Creations
  const fetchCreations = async () => {
    try {
      const res = await fetch(`/api/admin/creations?status=${creationFilter}&search=${encodeURIComponent(creationSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setCreations(data.creations || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([fetchStats(), fetchUsers(), fetchCreations()]).finally(() => {
        setLoading(false);
      });
    }
  }, [isAdmin]);

  // Handle User Credits
  const handleCreditChange = async (userId, delta) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditsDelta: delta })
      });
      if (res.ok) {
        setMsg(`Successfully modified credits (${delta > 0 ? "+" + delta : delta})`);
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      setMsg("Failed to update credits");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  // Handle User Role Toggle
  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setMsg(`Role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (e) {
      setMsg("Failed to update role");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  // Delete Creation
  const handleDeleteCreation = async (creationId) => {
    if (!confirm("Are you sure you want to delete this creation record?")) return;
    try {
      const res = await fetch(`/api/admin/creations?id=${creationId}`, { method: "DELETE" });
      if (res.ok) {
        setCreations(prev => prev.filter(c => c.id !== creationId));
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-zinc-400">
        <FiRefreshCw className="animate-spin text-3xl text-rose-500 mr-3" />
        <span>Loading Admin Portal...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl mb-4 shadow-xl">
          <FiShield />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Admin Access Restricted</h1>
        <p className="text-zinc-400 max-w-md mt-2 text-sm leading-relaxed">
          This portal is reserved for PornMake system administrators. Please sign in with an authorized administrative account.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all"
          >
            <FiArrowLeft /> Return to Studio
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all"
              title="Back to Studio"
            >
              <FiArrowLeft className="text-lg" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  PORNMAKE
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wider">
                  Admin Master
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Wan 2.2 Studio · Cluster Operations & Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cluster: {stats?.system?.engine || "Wan 2.2 (14B)"}</span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{session?.user?.name || "Admin"}</div>
                <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">{session?.user?.email}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                👑
              </div>
            </div>
          </div>
        </div>

          {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-t border-zinc-800/60 pt-3 overflow-x-auto">
          {[
            { id: "overview", label: "Dashboard Overview", icon: FiZap },
            { id: "users", label: "Users & Credits", icon: FiUsers },
            { id: "creations", label: "Video Task Queue", icon: FiVideo },
            { id: "system", label: "Cluster & External Links", icon: FiCpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-900/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon className="text-sm" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Floating Message Toast */}
        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xl">
            <FiCheckCircle className="text-base" /> {msg}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Registered Users</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400"><FiUsers /></div>
                </div>
                <div className="text-3xl font-black text-white">{stats?.stats?.totalUsers ?? 0}</div>
                <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">100% synced</span> with Supabase DB
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Video Tasks</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><FiVideo /></div>
                </div>
                <div className="text-3xl font-black text-white">{stats?.stats?.totalCreations ?? 0}</div>
                <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{stats?.stats?.completedCreations ?? 0} finished</span> · 
                  <span className="text-rose-400 font-semibold">{stats?.stats?.failedCreations ?? 0} failed</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pool Credits Available</span>
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400"><FiDollarSign /></div>
                </div>
                <div className="text-3xl font-black text-white">{stats?.stats?.totalCredits ?? 0}</div>
                <div className="text-[11px] text-zinc-400 mt-2">
                  Across all active user balances
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Today's Generations</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><FiClock /></div>
                </div>
                <div className="text-3xl font-black text-white">{stats?.stats?.todayCreations ?? 0}</div>
                <div className="text-[11px] text-zinc-400 mt-2">
                  Current 24h task volume
                </div>
              </div>
            </div>

            {/* Quick Status / Engine Status */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
                  <FiCpu className="text-lg" />
                  <span>Wan 2.2 Inference Pipeline Active</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Target ComfyUI Compute URL: <code className="text-amber-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{stats?.system?.comfyUiUrl}</code>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { fetchStats(); fetchUsers(); fetchCreations(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh Metrics
                </button>
              </div>
            </div>

            {/* Recent Feeds Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiUsers className="text-rose-500" /> Newest Users
                  </h3>
                  <button onClick={() => setActiveTab("users")} className="text-xs text-rose-400 hover:underline">
                    View all users →
                  </button>
                </div>
                <div className="space-y-2">
                  {stats?.recentUsers?.length > 0 ? (
                    stats.recentUsers.map(u => (
                      <div key={u.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name || "Anonymous User"}</div>
                            <div className="text-zinc-400 text-[10px]">{u.email || u.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {u.credits} Credits
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.role === "ADMIN" ? "bg-rose-500/20 text-rose-400" : "bg-zinc-800 text-zinc-400"}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-400 text-xs">No users recorded yet.</div>
                  )}
                </div>
              </div>

              {/* Recent Generations */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiVideo className="text-amber-500" /> Recent Video Tasks
                  </h3>
                  <button onClick={() => setActiveTab("creations")} className="text-xs text-amber-400 hover:underline">
                    View queue →
                  </button>
                </div>
                <div className="space-y-2">
                  {stats?.recentCreations?.length > 0 ? (
                    stats.recentCreations.map(c => (
                      <div key={c.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[280px]">
                          <div className="font-medium text-zinc-200 truncate">{c.prompt}</div>
                          <div className="text-[10px] text-zinc-400">{c.user?.email || "Guest"} · {new Date(c.createdAt).toLocaleTimeString()}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.status === "completed" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : c.status === "failed" 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-400 text-xs">No tasks submitted yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & CREDITS */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by Email, Name, User ID or API Key..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <FiRefreshCw /> Search Users
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Balance</th>
                      <th className="py-3.5 px-4">Creations</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Quick Credit Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {users.length > 0 ? (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.name || "Anonymous User"}</div>
                            <div className="text-[10px] text-zinc-400">{u.email || u.id}</div>
                            {u.customApiKey && (
                              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Key: {u.customApiKey.slice(0, 10)}...</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleRoleToggle(u.id, u.role)}
                              title="Click to toggle Admin/User"
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                                u.role === "ADMIN" 
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30" 
                                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                              }`}
                            >
                              {u.role || "USER"}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              {u.credits} Credits
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {u._count?.creations ?? 0} videos
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={actionLoading}
                                onClick={() => handleCreditChange(u.id, 50)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 transition-all"
                              >
                                +50
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleCreditChange(u.id, 100)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 transition-all"
                              >
                                +100
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleCreditChange(u.id, -20)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/30 transition-all"
                              >
                                -20
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-zinc-400">
                          No users matched your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO QUEUE */}
        {activeTab === "creations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {["all", "processing", "completed", "failed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => { setCreationFilter(st); fetchCreations(); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                      creationFilter === st
                        ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-sm">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                <input
                  type="text"
                  placeholder="Filter by prompt or email..."
                  value={creationSearch}
                  onChange={(e) => setCreationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCreations()}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Video Tasks List */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Prompt & Settings</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created Time</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {creations.length > 0 ? (
                      creations.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="font-semibold text-white line-clamp-2">{c.prompt}</div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                              <span>Ratio: {c.aspectRatio || "16:9"}</span> · 
                              <span>Res: {c.resolution || "720p"}</span> · 
                              <span className="font-mono">{c.requestId || c.id.slice(0, 8)}</span>
                            </div>
                            {c.error && (
                              <div className="text-[10px] text-rose-400 mt-1 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                                Error: {c.error}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-zinc-200">{c.user?.name || "Guest"}</div>
                            <div className="text-[10px] text-zinc-400">{c.user?.email || "—"}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "completed" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : c.status === "failed" 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                            {new Date(c.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCreation(c.id)}
                              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete record"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-zinc-400">
                          No generation tasks recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLUSTER & EXTERNAL LINKS */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiDatabase className="text-rose-500" /> Database & Architecture
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400">Database Engine</span>
                  <span className="font-semibold text-white">Supabase PostgreSQL (Prisma 7)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400">Connection Mode</span>
                  <span className="font-semibold text-emerald-400">Transaction Pooler (AWS East)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400">Video Model Pipeline</span>
                  <span className="font-semibold text-amber-300">Wan 2.2 14B (T2V / I2V)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400">Auth Strategy</span>
                  <span className="font-semibold text-white">NextAuth JWT + PrismaAdapter</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiExternalLink className="text-amber-500" /> Cloud Management Consoles
              </h3>
              <div className="space-y-2">
                <a
                  href="https://supabase.com/dashboard/project/msmugbazpeqakbjzywec"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold">Supabase Data Studio</span>
                  </div>
                  <FiExternalLink className="text-zinc-400 group-hover:text-white" />
                </a>

                <a
                  href="https://vercel.com/xihicihak/seedance-2-generator"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="font-semibold">Vercel Deployment & Runtime Logs</span>
                  </div>
                  <FiExternalLink className="text-zinc-400 group-hover:text-white" />
                </a>

                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                    <span className="font-semibold">Stripe Payment Dashboard</span>
                  </div>
                  <FiExternalLink className="text-zinc-400 group-hover:text-white" />
                </a>

                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-semibold">Cloudflare DNS & WAF Protection</span>
                  </div>
                  <FiExternalLink className="text-zinc-400 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
