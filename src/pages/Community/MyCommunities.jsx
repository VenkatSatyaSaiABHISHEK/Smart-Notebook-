import React from 'react';
import { Users, FileText, Settings, ChevronRight } from 'lucide-react';

const MyCommunities = ({ communities, onSelectCommunity }) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#111827] mb-2">My Communities</h2>
        <p className="text-[#6b7280]">Manage and access your active learning groups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div 
            key={community.id} 
            onClick={() => onSelectCommunity(community)}
            className="bg-white rounded-[24px] border border-gray-200 p-6 hover:shadow-xl hover:border-indigo-500 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
                {community.name.charAt(0)}
              </div>
              {community.isAdmin && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100">
                  <Settings className="w-3.5 h-3.5" /> Admin
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
              {community.name}
            </h3>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {community.memberCount || 1}
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Shared Notebook
              </div>
              <div className="ml-auto text-indigo-600 group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}

        {communities.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-[24px] border border-gray-200 border-dashed">
            You haven't joined any communities yet. Explore and join one!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCommunities;
