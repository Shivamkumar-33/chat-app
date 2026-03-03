import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  searchQuery: "",
  searchResults: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Refresh users to update unread counts
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  searchMessages: async (query, userId = null) => {
    try {
      const params = new URLSearchParams({ query });
      if (userId) params.append("userId", userId);
      
      const res = await axiosInstance.get(`/messages/search?${params}`);
      set({ searchResults: res.data, searchQuery: query });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
      return [];
    }
  },
  
  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
      const updatedMessages = get().messages.map((msg) =>
        msg._id === messageId ? res.data : msg
      );
      set({ messages: updatedMessages });
      toast.success("Message edited");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
      throw error;
    }
  },
  
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      const updatedMessages = get().messages.filter((msg) => msg._id !== messageId);
      set({ messages: updatedMessages });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      throw error;
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      
      // Refresh users to update unread counts
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    const { authUser } = useAuthStore.getState();

    socket.on("newMessage", (newMessage) => {
      // Only add message if it's from the selected user (incoming message)
      const isMessageFromSelectedUser = 
        String(newMessage.senderId) === String(selectedUser._id);
      
      if (isMessageFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
      
      // Refresh users to update unread counts
      get().getUsers();
    });
    
    socket.on("messageEdited", (editedMessage) => {
      const updatedMessages = get().messages.map((msg) =>
        msg._id === editedMessage._id ? editedMessage : msg
      );
      set({ messages: updatedMessages });
    });
    
    socket.on("messageDeleted", ({ messageId }) => {
      const updatedMessages = get().messages.filter((msg) => msg._id !== messageId);
      set({ messages: updatedMessages });
    });
    
    socket.on("messagesRead", ({ readerId }) => {
      // Update message status to read for messages sent by current user to the reader
      const updatedMessages = get().messages.map((msg) => {
        if (
          String(msg.senderId) === String(authUser._id) && 
          String(msg.receiverId) === String(readerId) && 
          msg.status !== "read"
        ) {
          return { ...msg, status: "read" };
        }
        return msg;
      });
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("messagesRead");
  },

  subscribeToTyping: (setIsTyping) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    const { authUser } = useAuthStore.getState();

    socket.on("typing-start", ({ senderId }) => {
      if (senderId === selectedUser._id && senderId !== authUser._id) {
        setIsTyping(true);
      }
    });

    socket.on("typing-stop", ({ senderId }) => {
      if (senderId === selectedUser._id && senderId !== authUser._id) {
        setIsTyping(false);
      }
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("typing-start");
    socket.off("typing-stop");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
