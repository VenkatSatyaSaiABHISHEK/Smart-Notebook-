import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ExploreCommunities from './ExploreCommunities';
import MyCommunities from './MyCommunities';
import CommunityDetail from './CommunityDetail';
import CreateCommunityModal from './CreateCommunityModal';
import { getTopCommunities, getUserCommunities } from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';

const CommunityHub = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my_communities'); // 'explore', 'my_communities'
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunitiesList, setMyCommunitiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = React.useCallback(async () => {
    if (currentUser?.uid) {
      setIsLoading(true);
      try {
        const tops = await getTopCommunities();
        const myComms = await getUserCommunities(currentUser.uid);
        
        setAllCommunities(tops);
        setMyCommunitiesList(myComms);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleCreateSuccess = async (newId) => {
    await fetchCommunities();
    const newlyCreated = myCommunitiesList.find(c => c.id === newId);
    if(newlyCreated) {
      setSelectedCommunity(newlyCreated);
    } else {
      // It might take a moment, but since fetchCommunities is awaited, it should be in the updated state.
      // However, myCommunitiesList state might not reflect immediately in the closure. 
      // Better to fetch again and find it directly:
      const updatedComms = await getUserCommunities(currentUser.uid);
      const createdComm = updatedComms.find(c => c.id === newId);
      if (createdComm) setSelectedCommunity(createdComm);
    }
  };

  const handleJoinRequestSent = (id) => {
    setAllCommunities(prev => prev.map(c => c.id === id ? { ...c, hasRequested: true } : c));
  };

  // If a community is selected, show details view
  if (selectedCommunity) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-full font-sans">
        <CommunityDetail 
          community={selectedCommunity} 
          onBack={() => setSelectedCommunity(null)} 
        />
      </div>
    );
  }

  // Otherwise, show Hub layout
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-full font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-2">Community Hub</h1>
          <p className="text-gray-500 max-w-2xl text-sm">
            Join groups, share knowledge, and build collective Master Notes.
          </p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#111827] hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Community
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('my_communities')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my_communities' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
        >
          My Communities
        </button>
        <button 
          onClick={() => setActiveTab('explore')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'explore' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
        >
          Explore Communities
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'my_communities' ? (
          <MyCommunities 
            communities={myCommunitiesList} 
            onSelectCommunity={setSelectedCommunity} 
          />
        ) : (
          <ExploreCommunities 
            communities={allCommunities} 
            onJoinRequestSent={handleJoinRequestSent}
          />
        )}
      </div>

      {/* Modals */}
      <CreateCommunityModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CommunityHub;
