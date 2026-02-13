import { useState, useEffect, useRef } from "react";
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
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
}

const contentFilterRules = [
  { pattern: /\bpaypal\b|\bwestern union\b|\bmoney transfer\b/i, action: "block", reason: "External payment methods not allowed" },
  { pattern: /\bwhatsapp\b|\btelegram\b|\bskype\b/i, action: "warn", reason: "External communication platforms not allowed" },
  { pattern: /\bemail\b.*@|@.*\bemail\b/i, action: "block", reason: "Sharing external contact information not allowed" },
  { pattern: /\bphone\b.*\d{10,}|\d{10,}.*\bphone\b/i, action: "block", reason: "Sharing phone numbers not allowed" },
  { pattern: /\bfree\b.*\btrial\b|\btrial\b.*\bfree\b/i, action: "warn", reason: "Suspicious promotional content" }
];

const MessagesView = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const fetchConversationsAsync = async () => {
      try {
        const response = await api.get('/conversations');
        if (isMounted) {
          setConversations(response.data);
          setIsLoadingConversations(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch conversations", error);
        }
      }
    };

    fetchConversationsAsync();
    const interval = setInterval(fetchConversationsAsync, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
      setIsLoadingConversations(false);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (selectedConversation) {
      const fetchMessagesAsync = async (userId: number) => {
        try {
          const response = await api.get(`/messages/${userId}`);
          if (isMounted) {
            setMessages(response.data);
          }
        } catch (error) {
          if (isMounted) {
            console.error("Failed to fetch messages", error);
          }
        }
      };

      fetchMessagesAsync(selectedConversation.id);
      
      // Locally clear unread count for better UX
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id ? { ...conv, unread_count: 0 } : conv
      ));

      const interval = setInterval(() => fetchMessagesAsync(selectedConversation.id), 5000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [selectedConversation]);

  const fetchMessages = async (userId: number) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

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
      const response = await api.post('/messages', {
        receiver_id: selectedConversation.id,
        content: messageInput
      });
      
      setMessages(prev => [...prev, response.data.data]);
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

  return (
    <div className="h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Messages</h2>
          <p className="text-muted-foreground">Secure communication center</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col border-none shadow-sm">
          <CardHeader className="pb-3 border-b">
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
                placeholder="Search..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {isLoadingConversations ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-primary/5 border-l-4 border-primary pl-3' : ''
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
                          <Badge variant="default" className="text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
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
        <Card className="lg:col-span-2 flex flex-col border-none shadow-sm">
          <CardHeader className="pb-3 border-b">
            {selectedConversation ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {selectedConversation.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedConversation.role}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <CardTitle className="text-lg">Select a conversation</CardTitle>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/10">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${Number(message.sender_id) === Number(user?.id) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          Number(message.sender_id) === Number(user?.id)
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-white text-foreground border rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${
                          Number(message.sender_id) === Number(user?.id) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {Number(message.sender_id) === Number(user?.id) && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-background border-t">
                  <div className="flex gap-3">
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
                      className="min-h-[50px] resize-none focus-visible:ring-primary"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="self-end h-[50px] w-[50px] rounded-xl"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Messages are protected by AI content filtering
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No Conversation Selected</h3>
                <p>Choose a contact to start messaging</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesView;
