import { X, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useRef, useCallback } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, searchMessages, searchResults, searchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef(null);

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchMessages(value, selectedUser._id);
      }, 300);
    }
  }, [selectedUser._id, searchMessages]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-sm btn-circle"
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button onClick={() => setSelectedUser(null)} className="btn btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      {showSearch && (
        <div className="mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="input input-sm w-full"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setShowSearch(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-circle"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {searchResults.length > 0 && searchQuery && (
            <div className="mt-2 text-xs text-base-content/70">
              Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ChatHeader;
