import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Edit, Trash2, X } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const { editMessage, deleteMessage } = useChatStore();

  useEffect(() => {
    if (!selectedUser._id) return;

    getMessages(selectedUser._id);

    subscribeToMessages();
    subscribeToTyping(setIsTyping);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
      setIsTyping(false);
      setEditingMessageId(null);
      setEditText("");
    };
  }, [selectedUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${String(message.senderId) === String(authUser._id) ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    String(message.senderId) === String(authUser._id)
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col relative group">
              {editingMessageId === message._id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input input-sm flex-1"
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        try {
                          await editMessage(message._id, editText);
                          setEditingMessageId(null);
                          setEditText("");
                        } catch (error) {
                          console.error("Error editing message:", error);
                        }
                      } else if (e.key === "Escape") {
                        setEditingMessageId(null);
                        setEditText("");
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      try {
                        await editMessage(message._id, editText);
                        setEditingMessageId(null);
                        setEditText("");
                      } catch (error) {
                        console.error("Error editing message:", error);
                      }
                    }}
                    className="btn btn-sm btn-circle"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessageId(null);
                      setEditText("");
                    }}
                    className="btn btn-sm btn-circle"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  {message.isEdited && (
                    <span className="text-xs opacity-50 mt-1">(edited)</span>
                  )}
                  
                  {/* Message actions - only show for own messages */}
                  {String(message.senderId) === String(authUser._id) && !editingMessageId && (
                    <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-base-100 rounded-lg p-1 shadow-lg">
                      <button
                        onClick={() => {
                          setEditingMessageId(message._id);
                          setEditText(message.text || "");
                        }}
                        className="btn btn-xs btn-circle"
                        title="Edit"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this message?")) {
                            try {
                              await deleteMessage(message._id);
                            } catch (error) {
                              console.error("Error deleting message:", error);
                            }
                          }
                        }}
                        className="btn btn-xs btn-circle btn-error"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  
                  {/* Message status indicator */}
                  {String(message.senderId) === String(authUser._id) && (
                    <div className="flex items-center gap-1 mt-1 self-end">
                      {message.status === "read" ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : message.status === "delivered" ? (
                        <CheckCheck size={14} className="text-gray-400" />
                      ) : (
                        <Check size={14} className="text-gray-400" />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-bubble">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-base-content rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-base-content rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-base-content rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
