import React from 'react';
import { Users, Lock, Unlock, ArrowRight } from 'lucide-react';
import { sendJoinRequest } from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';

const ExploreCommunities = ({ communities, onJoinRequestSent }) => {
  const { currentUser } = useAuth();

  const handleJoin = async (community) => {
    try {
      await sendJoinRequest(community.id, currentUser.uid, currentUser.displayName || currentUser.email || 'User');
      onJoinRequestSent(community.id);
    } catch (error) {
      console.error("Failed to send join request", error);
      alert("Failed to send request: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Top Communities</h2>
        <p className="text-[#6b7280]">Discover and join active knowledge hubs to learn collaboratively.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div key={community.id} className="bg-white rounded-[24px] border border-gray-200 p-6 hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                {community.memberCount || 0} Members
              </div>
              {community.settings?.isPrivate ? (
                <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg" title="Private (Requires Approval)"><Lock className="w-4 h-4" /></div>
              ) : (
                <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg" title="Public"><Unlock className="w-4 h-4" /></div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {community.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
              {community.settings?.description || "A community dedicated to collaborative learning and sharing master notes."}
            </p>

            {community.hasRequested ? (
              <button disabled className="w-full py-3 px-4 bg-gray-100 text-gray-500 font-bold rounded-xl text-sm border border-gray-200 cursor-not-allowed">
                Request Pending...
              </button>
            ) : (
              <button 
                onClick={() => handleJoin(community)}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2"
              >
                {community.settings?.isPrivate ? 'Request to Join' : 'Join Now'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {communities.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-[24px] border border-gray-200 border-dashed">
            No communities found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreCommunities;
