import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ChatVendor {
  id: string;
  full_name: string;
  username: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  from: "company" | "vendor";
}

export default function CompanyChat() {
  const [vendors, setVendors] = useState<ChatVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch vendor list
  useEffect(() => {
    api.get<{ vendors: ChatVendor[] }>("/api/company/chat/vendors")
      .then(data => {
        setVendors(data.vendors);
        if (data.vendors.length > 0 && !selectedVendor) {
          setSelectedVendor(data.vendors[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when vendor selected
  useEffect(() => {
    if (!selectedVendor) return;
    api.get<{ messages: ChatMessage[] }>(`/api/company/chat/${selectedVendor}`)
      .then(data => setMessages(data.messages))
      .catch(console.error);
  }, [selectedVendor]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedVendor || sending) return;
    setSending(true);
    try {
      const data = await api.post<{ message: ChatMessage }>(`/api/company/chat/${selectedVendor}`, {
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      // Update last message in vendor list
      setVendors(prev => prev.map(v =>
        v.id === selectedVendor ? { ...v, last_message: newMessage.trim(), last_message_at: new Date().toISOString() } : v
      ));
    } catch {
      // error handled by api
    } finally {
      setSending(false);
    }
  };

  const selectedVendorData = vendors.find(v => v.id === selectedVendor);

  const filteredVendors = vendors.filter(v =>
    (v.full_name || v.username).toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Hoy";
    if (d.toDateString() === yesterday.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-[500px] bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold">Chat</h1>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Vendor list */}
        <div className="col-span-12 md:col-span-4 rounded-xl border bg-white overflow-hidden flex flex-col">
          <div className="p-3 border-b space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Conversaciones ({vendors.length})
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                placeholder="Buscar vendedor..."
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredVendors.map(vendor => {
              const isActive = selectedVendor === vendor.id;
              const initials = (vendor.full_name || vendor.username).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              const hasMessages = !!vendor.last_message;

              return (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b ${
                    isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{initials}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{vendor.full_name || vendor.username}</p>
                      {vendor.last_message_at && (
                        <span className="text-[9px] text-muted-foreground shrink-0 ml-1">
                          {formatTime(vendor.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {hasMessages ? vendor.last_message : "Sin mensajes aun"}
                    </p>
                  </div>
                  {vendor.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {vendor.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredVendors.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">No se encontraron vendedores</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="col-span-12 md:col-span-8 rounded-xl border bg-white flex flex-col">
          {selectedVendorData ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {(selectedVendorData.full_name || selectedVendorData.username).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedVendorData.full_name || selectedVendorData.username}</p>
                  <p className="text-[10px] text-muted-foreground">Vendedor</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedMessages.length > 0 ? (
                  groupedMessages.map((group, gi) => (
                    <div key={gi}>
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] text-muted-foreground font-medium px-2">{group.date}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-2">
                        {group.messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.from === "company" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              msg.from === "company"
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-gray-100 rounded-bl-md"
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <p className={`text-[9px] mt-1 ${msg.from === "company" ? "text-white/60" : "text-muted-foreground"}`}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Sin mensajes</p>
                    <p className="text-xs text-muted-foreground/70">
                      Envia el primer mensaje a {selectedVendorData.full_name || selectedVendorData.username}
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Selecciona un vendedor</p>
              <p className="text-xs text-muted-foreground/70">Elige una conversacion del panel izquierdo</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
