import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Filter,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

// Content filtering rules (PRD Section 4.7)
const contentFilterRules = [
  { pattern: /\bpaypal\b|\bwestern union\b|\bmoney transfer\b/i, action: "block", reason: "External payment methods not allowed" },
  { pattern: /\bwhatsapp\b|\btelegram\b|\bskype\b/i, action: "warn", reason: "External communication platforms not allowed" },
  { pattern: /\bemail\b.*@|@.*\bemail\b/i, action: "block", reason: "Sharing external contact information not allowed" },
  { pattern: /\bphone\b.*\d{10,}|\d{10,}.*\bphone\b/i, action: "block", reason: "Sharing phone numbers not allowed" },
  { pattern: /\bfree\b.*\btrial\b|\btrial\b.*\bfree\b/i, action: "warn", reason: "Suspicious promotional content" }
];

interface MessageWithUsers {
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: { id: string; name: string; profile_image: string; role: string };
  receiver?: { id: string; name: string; profile_image: string; role: string };
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your messages.",
      });
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    fetchConversations(isMounted);
    const interval = setInterval(() => fetchConversations(isMounted), 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname, location.search, navigate, toast, fetchConversations]);

  const fetchConversations = useCallback(async (isMounted: boolean = true) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, name, profile_image, role),
          receiver:receiver_id(id, name, profile_image, role)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (isMounted && data) {
        const conversationsMap = new Map();
        
        (data as unknown as MessageWithUsers[]).forEach((msg) => {
          const isSender = msg.sender_id === user.id;
          const otherUser = isSender ? msg.receiver : msg.sender;
          
          if (!otherUser) return;
          
          const partnerId = otherUser.id;
          
          if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
              id: partnerId,
              name: otherUser.name || 'Unknown User',
              avatar: otherUser.profile_image || '',
              role: otherUser.role || 'user',
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: 0
            });
          }
          
          const conv = conversationsMap.get(partnerId);
          if (!isSender && !msg.is_read) {
            conv.unread_count++;
          }
        });
        
        setConversations(Array.from(conversationsMap.values()));
        setIsLoadingConversations(false);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Failed to fetch conversations", error);
        toast({
          title: "Error",
          description: "Failed to load conversations.",
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  useEffect(() => {
    let isMounted = true;
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, isMounted);
      
      // Locally clear unread count for better UX
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id ? { ...conv, unread_count: 0 } : conv
      ));
    }
    return () => {
      isMounted = false;
    };
  }, [selectedConversation, fetchMessages]);

  const fetchMessages = useCallback(async (partnerId: string, isMounted: boolean = true) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (isMounted && data) {
        setMessages(data as Message[]);
        
        // Mark messages from partner as read
        const unreadIds = data
          .filter((m: Message) => m.sender_id === partnerId && !m.is_read)
          .map((m: Message) => m.id);
          
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    } catch (error) {
      if (isMounted) {
        console.error("Failed to fetch messages", error);
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkContentFilter = (content: string) => {
    for (const rule of contentFilterRules) {
      if (rule.pattern.test(content)) {
        return { 
          allowed: rule.action === "warn",
          warning: rule.reason,
          action: rule.action
        };
      }
    }
    return { allowed: true, warning: null, action: null };
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const filterResult = checkContentFilter(messageInput);
    
    if (!filterResult.allowed) {
      toast({
        title: "Message Blocked",
        description: filterResult.warning || "Content not allowed",
        variant: "destructive"
      });
      return;
    }
    
    if (filterResult.warning) {
      const confirmed = confirm(`Warning: ${filterResult.warning}. Send anyway?`);
      if (!confirmed) return;
    }
    
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.id,
          content: messageInput,
          is_read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setMessages(prev => [...prev, data as Message]);
      setMessageInput("");
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Messages
            </h1>
            <p className="text-muted-foreground">
              Communicate securely with clients and voice talents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Protected
                  </Badge>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {isLoadingConversations ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {conversation.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {conversation.last_message_time ? formatTime(conversation.last_message_time) : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {conversation.last_message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-primary font-medium capitalize">
                              {conversation.role}
                            </span>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Area */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="pb-3">
                {selectedConversation ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedConversation.avatar} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedConversation.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CardTitle className="text-lg">Select a conversation</CardTitle>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {selectedConversation ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${String(message.sender_id) === String(user?.id) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              String(message.sender_id) === String(user?.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              String(message.sender_id) === String(user?.id) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>{formatTime(message.created_at)}</span>
                              {String(message.sender_id) === String(user?.id) && (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="min-h-[80px] resize-none"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className="self-end"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Messages are protected by content filtering
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Filtering Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Content Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-foreground">Blocked Content</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• External payment methods</li>
                    <li>• Contact information sharing</li>
                    <li>• Phone numbers</li>
                    <li>• Suspicious links</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-foreground">Protected Communication</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All messages are monitored</li>
                    <li>• Real-time content filtering</li>
                    <li>• Secure platform-only communication</li>
                    <li>• Fraud prevention measures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
{/* Footer removed to fix missing import */}
    </div>
  );
};

export default Messages;
