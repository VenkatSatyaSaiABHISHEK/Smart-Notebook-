import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Brain, Activity, ShieldAlert, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Users', value: '8,249', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Active Communities', value: '142', change: '+5%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { title: 'Notes Created', value: '45.2K', change: '+18%', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { title: 'AI API Calls', value: '1.2M', change: '+24%', icon: Brain, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  ];

  const recentUsers = [
    { name: 'John Doe', email: 'john@example.com', status: 'Active', joined: '2 mins ago' },
    { name: 'Alice Smith', email: 'alice@example.com', status: 'Active', joined: '1 hour ago' },
    { name: 'Bob Johnson', email: 'bob@example.com', status: 'Flagged', joined: '5 hours ago' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black mb-2 text-gray-900 tracking-tight flex items-center">
            Admin Panel
          </h1>
          <p className="text-gray-500 font-medium text-[16px]">Platform overview and management.</p>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          <span className="text-emerald-700 font-bold text-sm">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white rounded-[2rem] p-6 border ${stat.border} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all group`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
            <p className="text-gray-500 font-bold text-[14px] uppercase tracking-wider">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <h2 className="text-2xl font-black mb-8 flex items-center text-gray-900 tracking-tight">
            <Users className="w-6 h-6 mr-3 text-indigo-500" />
            Recent Onboarding
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.15em]">
                  <th className="pb-4">User</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map((user, i) => (
                  <tr key={i} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-extrabold text-gray-900 text-[15px]">{user.name}</div>
                      <div className="text-[13px] font-medium text-gray-500">{user.email}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm ${
                        user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-[13px] font-bold text-gray-500">{user.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Moderation Alerts */}
        <div className="bg-gradient-to-br from-rose-50 to-white rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <h2 className="text-2xl font-black mb-8 flex items-center text-rose-600 tracking-tight">
            <ShieldAlert className="w-6 h-6 mr-3" />
            Moderation Alerts
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((alert) => (
              <div key={alert} className="p-5 bg-white border border-rose-100 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-extrabold text-[15px] text-gray-900">Suspicious Activity Detected</h4>
                  <p className="text-[13px] font-medium text-gray-500 mt-1">Community <span className="font-bold text-gray-700">"Hackers Space"</span> flagged for inappropriate content.</p>
                </div>
                <button className="px-5 py-2.5 bg-rose-100 text-rose-700 rounded-xl text-[13px] font-extrabold hover:bg-rose-200 transition-colors shadow-sm ml-4 shrink-0">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
