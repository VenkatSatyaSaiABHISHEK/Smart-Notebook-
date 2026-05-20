import React, { useState } from 'react';
import { X, Shield, Lock, MessageSquare, FileText } from 'lucide-react';
import { createCommunity } from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';

const CreateCommunityModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [allowText, setAllowText] = useState(true);
  const [allowFilesOnly, setAllowFilesOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create community via service
      const communityId = await createCommunity(name, currentUser.uid, {
        description,
        isPrivate,
        allowTextMessages: allowText,
        allowFilesOnly
      });
      onSuccess(communityId);
      onClose();
    } catch (error) {
      console.error("Failed to create community", error);
      alert("Failed to create community: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Community</h2>
            <p className="text-sm text-gray-500">Establish a new knowledge hub</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Community Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. King, Python Masters..." 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?" 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
              ></textarea>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Admin Settings</h3>
            
            <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Lock className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Private Community</div>
                  <div className="text-xs text-gray-500">Requires admin approval to join</div>
                </div>
              </div>
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MessageSquare className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Allow Text Messages</div>
                  <div className="text-xs text-gray-500">Members can chat and discuss</div>
                </div>
              </div>
              <input type="checkbox" checked={allowText} onChange={(e) => setAllowText(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Files & Data Only</div>
                  <div className="text-xs text-gray-500">Restrict sharing to files and notebooks only</div>
                </div>
              </div>
              <input type="checkbox" checked={allowFilesOnly} onChange={(e) => setAllowFilesOnly(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 bg-[#111827] hover:bg-black text-white font-bold rounded-xl text-sm transition-colors shadow-lg flex justify-center items-center gap-2">
              {loading ? 'Creating...' : <><Shield className="w-4 h-4" /> Create as Admin</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
