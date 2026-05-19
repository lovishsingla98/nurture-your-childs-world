import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { Send, Bot, User } from 'lucide-react';

interface Message { id: string; content: string; sender: 'user' | 'bot'; timestamp: Date; }

const ParentsChatbot = () => {
  const { childId } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: "Hi! I'm your parenting assistant. Feel free to ask me anything about parenting strategies, activities, or your child's progress!", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), content: inputMessage, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]); setInputMessage(''); setIsLoading(true);
    try {
      const r = await fetch('/api/parents-chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childId, message: inputMessage }) });
      const data = await r.json();
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), content: data.message || "Could you tell me more?", sender: 'bot', timestamp: new Date() }]);
    } catch {
      setTimeout(() => { setMessages(prev => [...prev, { id: (Date.now()+1).toString(), content: "Great question! Based on your child's profile, I'd recommend focusing on hands-on activities to nurture their curiosity.", sender: 'bot', timestamp: new Date() }]); }, 1500);
    } finally { setIsLoading(false); }
  };

  const quickQs = ["How to help with focus?", "Activities for my child?", "Handle frustration?", "Weekend learning ideas"];

  return (
    <MobileSimulatorLayout title="Parents Chatbot" subtitle="Personalized parenting advice" backUrl={`/child/${childId}`}>
      <div className="flex flex-col h-full min-h-[400px]">
        {/* Messages */}
        <div className="flex-1 space-y-2.5 mb-3">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-1.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'bot' && <Avatar className="h-5 w-5 flex-none"><AvatarFallback className="bg-[#D8EADB] text-[#2D6A4F]"><Bot className="h-2.5 w-2.5" /></AvatarFallback></Avatar>}
              <div className={`max-w-[75%] rounded-2xl px-2.5 py-1.5 ${m.sender === 'user' ? 'bg-[#2D6A4F] text-white' : 'bg-white border border-[#D5DFD0] text-[#18211A]'}`}>
                <p className="text-[9px] leading-relaxed font-semibold">{m.content}</p>
                <span className="text-[6px] opacity-60 mt-0.5 block">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {m.sender === 'user' && <Avatar className="h-5 w-5 flex-none"><AvatarFallback className="bg-[#EAF0E6] text-[#607060]"><User className="h-2.5 w-2.5" /></AvatarFallback></Avatar>}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-1.5 justify-start">
              <Avatar className="h-5 w-5 flex-none"><AvatarFallback className="bg-[#D8EADB] text-[#2D6A4F]"><Bot className="h-2.5 w-2.5" /></AvatarFallback></Avatar>
              <div className="bg-white border border-[#D5DFD0] rounded-2xl px-3 py-2">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#607060] rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><div className="w-1.5 h-1.5 bg-[#607060] rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><div className="w-1.5 h-1.5 bg-[#607060] rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length === 1 && (
          <div className="mb-2">
            <p className="text-[7px] text-[#607060] font-bold mb-1.5 uppercase">Quick questions</p>
            <div className="grid grid-cols-2 gap-1">{quickQs.map((q,i) => <button key={i} onClick={() => setInputMessage(q)} className="text-left text-[8px] font-semibold text-[#2D6A4F] bg-[#EAF0E6] border border-[#D5DFD0] rounded-xl px-2 py-1.5 hover:bg-[#D8EADB] transition-colors">{q}</button>)}</div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-1.5 pt-2 border-t border-[#D5DFD0]">
          <Input placeholder="Ask anything..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') handleSendMessage(); }} disabled={isLoading} className="flex-1 text-[10px] border-[#D5DFD0] bg-white rounded-full h-8 px-3 focus:border-[#2D6A4F]" />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} size="icon" className="bg-[#2D6A4F] hover:bg-[#1F513C] rounded-full h-8 w-8"><Send className="h-3 w-3" /></Button>
        </div>
      </div>
    </MobileSimulatorLayout>
  );
};

export default ParentsChatbot;