import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { MessageCircle, X, Send, Building2, Download, Minus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Chatbot = () => {
  const { user, issues, workers, escalateIssue, rateIssue } = useContext(AppContext);
  const [chatState, setChatState] = useState('closed'); // 'closed' | 'open' | 'minimized'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastMentionedIssueId, setLastMentionedIssueId] = useState(null);
  const [hasShownProactive, setHasShownProactive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const messagesEndRef = useRef(null);

  const myIssues = issues.filter(i => i.citizenId === user?.id);
  const hasUnresolved = myIssues.some(i => i.status !== 'Resolved' && i.status !== 'Rejected');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatState === 'open') scrollToBottom();
  }, [messages, chatState, isTyping]);

  useEffect(() => {
    if (chatState === 'open' && messages.length === 0 && !hasShownProactive) {
      handleProactiveNotifications();
    }
  }, [chatState]);

  const handleProactiveNotifications = () => {
    setHasShownProactive(true);
    let initialMsgs = [];
    
    // Check for proactive notifications
    myIssues.forEach(i => {
      // Very basic mock check: if last history was within 5 minutes, consider it "just updated"
      // In a real app this would track last login time
      
      if (i.status === 'Resolved' && !i.rating) {
        initialMsgs.push({
          id: Date.now() + Math.random(),
          sender: 'bot',
          text: `✅ Great news! Your issue <strong>#${i.id}</strong> (${i.type}) has been resolved!`,
          timestamp: new Date().toISOString(),
          isHtml: true,
          action: { type: 'RATING', issueId: i.id }
        });
      } else if (i.status === 'Pending') {
        const daysPending = differenceInDays(new Date(), new Date(i.submittedAt));
        if (daysPending >= 5 && !i.assignedWorker) {
          initialMsgs.push({
            id: Date.now() + Math.random(),
            sender: 'bot',
            text: `⚠️ Your issue <strong>#${i.id}</strong> has been pending for ${daysPending} days with no worker assigned yet. Type 'escalate ${i.id}' to escalate it.`,
            timestamp: new Date().toISOString(),
            isHtml: true
          });
        }
      }
    });

    initialMsgs.push({
      id: Date.now() + 999,
      sender: 'bot',
      text: `👋 Hi! I'm your NagarSeva assistant.\nYou can ask me things like:\n• What is the status of my issue?\n• Show all my pending issues\n• When was my issue resolved?`,
      timestamp: new Date().toISOString(),
      chips: ['📋 My Issues', '⏳ Pending', '✅ Resolved']
    });

    setMessages(initialMsgs);
  };

  const getStatusBadgeHtml = (status) => {
    let color = '', bg = '';
    switch(status) {
      case 'Pending': color = '#F59E0B'; bg = '#F59E0B22'; break;
      case 'Assigned': color = '#3B82F6'; bg = '#3B82F622'; break;
      case 'In Progress': color = '#F97316'; bg = '#F9731622'; break;
      case 'Resolved': color = '#10B981'; bg = '#10B98122'; break;
      case 'Rejected': color = '#EF4444'; bg = '#EF444422'; break;
      default: color = '#94A3B8'; bg = '#94A3B822';
    }
    return `<span style="display:inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; color: ${color}; background-color: ${bg};">${status}</span>`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#F59E0B';
      case 'Assigned': return '#3B82F6';
      case 'In Progress': return '#F97316';
      case 'Resolved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#2A3347';
    }
  };

  const generateIssueCard = (issue) => {
    let assignedInfo = 'Not yet assigned';
    if (issue.assignedWorker) {
      const w = workers.find(work => work.id === issue.assignedWorker);
      assignedInfo = w ? w.name : issue.assignedWorker;
    }
    
    let etaHtml = '';
    if (issue.status !== 'Resolved' && issue.status !== 'Rejected') {
      let etaStr = '';
      if (issue.priority === 'High') etaStr = 'Usually resolved within 24–48 hours';
      else if (issue.priority === 'Medium') etaStr = 'Usually resolved within 3–5 days';
      else etaStr = 'Usually resolved within 7–10 days';
      
      etaHtml = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #2A3347; font-size: 11px; color: #94A3B8;">
        ⏱️ ETA: ${etaStr}
      </div>`;
    }
    let resolutionHtml = '';
    if (issue.status === 'Resolved' && issue.resolutionPhoto) {
      const w = workers.find(work => work.id === issue.assignedWorker) || { name: issue.resolvedBy || 'Worker' };
      resolutionHtml = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #2A3347; font-size: 11px; color: #10B981;">
        📸 Resolution photo uploaded by ${w.name}. Open 'My Reports' to view the proof.
      </div>`;
    }

    return `
      <div style="background: #1C2333; border: 1px solid #2A3347; border-left: 3px solid ${getStatusColor(issue.status)}; border-radius: 8px; padding: 12px; margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
          <strong style="color: #F1F5F9;">Issue #${issue.id}</strong>
          ${getStatusBadgeHtml(issue.status)}
        </div>
        <div style="color: #94A3B8; font-size: 12px; line-height: 1.5;">
          Type: <span style="color: #F1F5F9;">${issue.type}</span><br/>
          Reported: <span style="color: #F1F5F9;">${format(new Date(issue.submittedAt), 'MMM dd, yyyy')}</span><br/>
          Assigned to: <span style="color: #F1F5F9;">${assignedInfo}</span>
        </div>
        ${etaHtml}
        ${resolutionHtml}
      </div>
    `;
  };

  const generateResponse = (text) => {
    const lower = text.toLowerCase();
    
    // Check for explicit ID match
    const citMatch = text.match(/CIT-\d{8}-\d{4}/i);
    let targetIssueId = citMatch ? citMatch[0].toUpperCase() : null;

    // Pronoun detection
    const hasPronoun = /\b(that issue|this issue|it|the issue|another issue|the other one)\b/.test(lower);
    if (!targetIssueId && hasPronoun) {
      if (lastMentionedIssueId) {
        targetIssueId = lastMentionedIssueId;
      } else {
        return {
          text: `Which issue are you referring to?\nPlease share the Issue ID or type 'my issues' to see your list.`,
          chips: ['📋 My Issues']
        };
      }
    }

    if (targetIssueId) {
      setLastMentionedIssueId(targetIssueId);
      const issue = issues.find(i => i.id === targetIssueId);
      if (issue) {
        let action = null;
        let chips = ['📋 Other Issues'];
        
        if (issue.status === 'Resolved') {
          chips = ['⭐ Rate Resolution', '📋 Other Issues'];
          action = { type: 'RATING', issueId: issue.id };
        } else if (issue.status === 'Pending') {
          chips = ['🚨 Escalate', '👷 Worker Info', '📋 My Issues'];
        }

        return {
          text: generateIssueCard(issue),
          isHtml: true,
          chips,
          action
        };
      } else {
        return { text: `I couldn't find that issue ID.\nPlease check the ID and try again.`, chips: ['📋 My Issues'] };
      }
    }

    // Explicit Escalate Handling
    if (lower.startsWith('yes, escalate') || /(escalate|urgent|no update|still pending|ignored)/.test(lower)) {
      let escId = targetIssueId || lastMentionedIssueId;
      if (!escId && myIssues.length > 0) escId = myIssues[0].id; // Fallback to latest

      if (escId) {
        const issue = issues.find(i => i.id === escId);
        if (issue && issue.status !== 'Resolved' && issue.status !== 'Rejected') {
          const days = differenceInDays(new Date(), new Date(issue.submittedAt));
          
          if (lower.includes('yes, escalate') || lower.includes(`escalate ${escId.toLowerCase()}`)) {
            escalateIssue(escId);
            return {
              text: `✅ Your issue #${escId} has been escalated.\nAdmin has been notified and priority set to High.`,
              chips: ['📋 My Issues']
            };
          } else {
             return {
              text: `🚨 <strong>Escalation Request</strong><br/>Your issue #${escId} has been pending for ${days} days.<br/><br/>Would you like to escalate this to the admin?`,
              isHtml: true,
              chips: [`Yes, Escalate ${escId}`, `No, I'll wait`]
            };
          }
        }
      }
    }

    // SHOW ALL MY ISSUES
    if (/(my issues|all issues|show issues|my reports|list)/.test(lower)) {
      if (myIssues.length === 0) return { text: `You haven't reported any issues yet.` };
      const list = myIssues.map(i => `• ${i.id} — ${i.type} — ${getStatusBadgeHtml(i.status)}`).join('<br/>');
      return {
        text: `Here are all your reported issues:<br/><br/>${list}`,
        isHtml: true,
        chips: ['⏳ Show Pending', '✅ Show Resolved', '🚨 Escalate Oldest']
      };
    }

    // PENDING ISSUES
    if (/(pending|not resolved|waiting|open)/.test(lower)) {
      const pending = myIssues.filter(i => i.status === 'Pending');
      if (pending.length === 0) return { text: `You have no pending issues.`, chips: ['📋 My Issues'] };
      const list = pending.map(i => `• ${i.id} — ${i.type}`).join('<br/>');
      return {
        text: `Here are your pending issues:<br/><br/>${list}`,
        isHtml: true,
        chips: ['📋 My Issues', '🚨 Escalate Oldest']
      };
    }

    // RESOLVED ISSUES
    if (/(resolved|fixed|completed|done)/.test(lower)) {
      const resolved = myIssues.filter(i => i.status === 'Resolved');
      if (resolved.length === 0) return { text: `You have no resolved issues yet.`, chips: ['📋 My Issues'] };
      const list = resolved.map(i => `• ${i.id} — ${i.type}`).join('<br/>');
      return {
        text: `Here are your resolved issues:<br/><br/>${list}`,
        isHtml: true,
        chips: ['📋 My Issues']
      };
    }

    // LATEST / RECENT ISSUE
    if (/(latest|recent|last|newest)/.test(lower)) {
      if (myIssues.length === 0) return { text: `You haven't reported any issues yet.` };
      const issue = myIssues[0];
      setLastMentionedIssueId(issue.id);
      return {
        text: `Here is your most recent issue:<br/><br/>${generateIssueCard(issue)}`,
        isHtml: true,
        chips: issue.status === 'Resolved' ? ['⭐ Rate Resolution'] : ['🚨 Escalate', '👷 Worker Info']
      };
    }

    // WORKER INFO
    if (/(who is assigned|which worker|worker name)/.test(lower)) {
      let issueId = lastMentionedIssueId;
      if (!issueId && myIssues.length > 0) issueId = myIssues[0].id;

      if (!issueId) return { text: `You don't have any reported issues.` };
      
      const issue = issues.find(i => i.id === issueId);
      if (!issue.assignedWorker) {
         return { text: `Your issue (${issue.id}) has not been assigned to a worker yet.`, chips: ['🚨 Escalate'] };
      }
      const w = workers.find(work => work.id === issue.assignedWorker);
      if (w) {
        return {
          text: `👷 <strong>${w.name}</strong> from the ${w.role} is assigned to your issue (${issue.id}).<br/>Current shift: ${w.shift}`,
          isHtml: true,
          chips: ['📋 My Issues']
        };
      }
      return { text: `Worker ${issue.assignedWorker} is assigned to your issue.`, chips: ['📋 My Issues'] };
    }

    // GREETING
    if (/^(hi|hello|hey|namaste)\b/.test(lower)) {
      return {
        text: `Namaste! 🙏 How can I help you today?\nYou can ask about your issue status or type your Issue ID directly.`,
        chips: ['📋 My Issues', '⏳ Pending', '✅ Resolved']
      };
    }

    // HELP
    if (/(help|what can you do|commands)/.test(lower)) {
      return {
        text: `👋 Hi! I'm your NagarSeva assistant.\nYou can ask me things like:\n• What is the status of my issue?\n• Show all my pending issues\n• When was my issue resolved?`,
        chips: ['📋 My Issues', '⏳ Pending', '✅ Resolved']
      };
    }

    // UNKNOWN
    return {
      text: `I didn't quite understand that.\nTry typing your Issue ID (e.g. CIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001) or ask 'show my issues' to get started.`,
      chips: ['📋 My Issues', '⏳ Pending', '✅ Resolved']
    };
  };

  const handleSend = (textStr) => {
    const text = textStr || inputValue;
    if (!text.trim()) return;

    setSuggestions([]);
    const newMsg = { id: Date.now(), sender: 'user', text: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: response.text, 
          timestamp: new Date().toISOString(), 
          isHtml: response.isHtml,
          chips: response.chips || [],
          action: response.action
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleRating = (issueId, stars) => {
    rateIssue(issueId, stars);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: `Rated ${stars} stars`, timestamp: new Date().toISOString() }
    ]);
    setIsTyping(true);
    
    setTimeout(() => {
      let reply = '';
      if (stars <= 2) {
        reply = `We're sorry to hear that. Would you like to reopen this issue?`;
      } else if (stars === 3) {
        reply = `Thank you for your feedback! We'll keep improving.`;
      } else {
        reply = `🙏 Thank you! Glad we could help. Your city thanks you for reporting.`;
      }
      
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply, timestamp: new Date().toISOString(), chips: ['📋 My Issues'] }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Autocomplete Logic
    if (val.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    
    const lower = val.toLowerCase();
    let sugs = [];

    // Match CIT IDs
    if (lower.includes('c') || lower.includes('ci') || lower.includes('cit')) {
       sugs = myIssues.filter(i => i.id.toLowerCase().includes(lower)).map(i => i.id);
    }
    
    // Match commands
    if (lower.startsWith('s') || lower.startsWith('sh')) sugs.push('show my issues');
    if (lower.startsWith('p') || lower.startsWith('pe')) sugs.push('pending issues');
    if (lower.startsWith('r') || lower.startsWith('re')) sugs.push('resolved issues');
    if (lower.startsWith('e') || lower.startsWith('es')) sugs.push('escalate');

    setSuggestions(sugs.slice(0, 3));
  };

  const exportChat = () => {
    let content = "NagarSeva Chatbot History\n=========================\n\n";
    messages.forEach(m => {
      const time = format(new Date(m.timestamp), 'MMM dd, yyyy HH:mm:ss');
      const sender = m.sender === 'user' ? 'You' : 'NagarSeva Assistant';
      // Strip HTML tags for clean text export
      const cleanText = m.text.replace(/<[^>]+>/g, '');
      content += `[${time}] ${sender}:\n${cleanText}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NagarSeva_Chat_${format(new Date(), 'yyyyMMdd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== 'Citizen') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Minimized Bar */}
      {chatState === 'minimized' && (
        <button 
          onClick={() => setChatState('open')}
          className="bg-[#111827] border border-[#2A3347] rounded-full h-12 px-5 flex items-center space-x-3 shadow-2xl hover:border-[#F59E0B] transition-colors"
        >
          <div className="h-6 w-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0">
            <span className="text-[#0A0E1A] text-[10px] font-bold">NS</span>
          </div>
          <span className="font-heading font-bold text-[#F1F5F9] text-sm mr-2">NagarSeva Assistant</span>
          <span className="text-[#F59E0B] text-xs font-bold tracking-wide flex items-center">
            <span className="text-[10px] mr-1">▲</span> Open
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {chatState === 'open' && (
        <div 
          className="mb-4 w-[360px] h-[480px] bg-[#111827] border border-[#2A3347] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          style={{ animation: 'slideUpFade 0.3s ease-out forwards' }}
        >
          {/* Header */}
          <div className="bg-[#1C2333] border-b border-[#2A3347] p-3.5 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-[#F59E0B] p-1.5 rounded-lg">
                <Building2 className="h-5 w-5 text-[#0A0E1A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-[#F1F5F9] text-sm">NagarSeva Assistant</span>
                <span className="text-[#94A3B8] text-[11px]">Ask about your issue status</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={exportChat} className="text-[#475569] hover:text-[#F1F5F9] transition-colors p-1" title="Export Chat">
                <Download className="h-4 w-4" />
              </button>
              <button onClick={() => setChatState('minimized')} className="text-[#475569] hover:text-[#F1F5F9] transition-colors p-1" title="Minimize">
                <Minus className="h-5 w-5" />
              </button>
              <button onClick={() => setChatState('closed')} className="text-[#475569] hover:text-[#EF4444] transition-colors p-1" title="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#111827] relative">
            {messages.map((msg, idx) => (
              <div key={msg.id} className="flex flex-col">
                {msg.sender === 'bot' ? (
                  <div className="flex items-end space-x-2">
                    <div className="h-6 w-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0">
                      <span className="text-[#0A0E1A] text-[10px] font-bold">NS</span>
                    </div>
                    <div className="flex flex-col">
                      <div 
                        className="bg-[#1C2333] text-[#F1F5F9] px-4 py-2.5 text-sm max-w-[280px]"
                        style={{ borderRadius: '12px 12px 12px 2px' }}
                      >
                        {msg.isHtml ? (
                          <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        )}
                        
                        {/* Interactive Action Renderers */}
                        {msg.action && msg.action.type === 'RATING' && (
                           <div className="mt-3 pt-3 border-t border-[#2A3347]">
                             <p className="text-[12px] text-[#94A3B8] mb-2">How satisfied are you with the resolution?</p>
                             <div className="flex space-x-1">
                               {[1,2,3,4,5].map(star => (
                                 <button 
                                   key={star} 
                                   onClick={() => handleRating(msg.action.issueId, star)}
                                   className="text-[#475569] hover:text-[#F59E0B] transition-colors text-lg focus:outline-none"
                                 >
                                   ★
                                 </button>
                               ))}
                             </div>
                           </div>
                        )}
                        
                      </div>
                      <span className="text-[#475569] text-[11px] mt-1 ml-1">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                      
                      {msg.chips && msg.chips.length > 0 && idx === messages.length - 1 && !isTyping && (
                        <div className="flex flex-wrap gap-2 mt-3 ml-1 max-w-[280px]">
                          {msg.chips.map(chip => (
                            <button 
                              key={chip}
                              onClick={() => handleSend(chip)}
                              className="bg-[#1C2333] border border-[#2A3347] text-[#94A3B8] hover:border-[#F59E0B] hover:text-[#F59E0B] rounded-full px-3 py-1.5 text-[12px] transition-colors whitespace-nowrap"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end justify-end space-x-2">
                    <div className="flex flex-col items-end">
                      <div 
                        className="bg-[#F59E0B] text-[#0A0E1A] px-4 py-2.5 text-sm font-medium whitespace-pre-wrap max-w-[280px]"
                        style={{ borderRadius: '12px 12px 2px 12px' }}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[#475569] text-[11px] mt-1 mr-1">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-end space-x-2">
                <div className="h-6 w-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0">
                  <span className="text-[#0A0E1A] text-[10px] font-bold">NS</span>
                </div>
                <div className="bg-[#1C2333] px-4 py-3.5 flex items-center space-x-1" style={{ borderRadius: '12px 12px 12px 2px' }}>
                  <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" style={{ animation: 'typingBounce 1.4s infinite ease-in-out both' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" style={{ animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" style={{ animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-[#0A0E1A] border-t border-l border-r border-[#2A3347] rounded-t-lg mx-3 p-1 shrink-0 shadow-lg absolute bottom-[60px] left-0 right-0 z-10">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setInputValue(sug); setSuggestions([]); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#94A3B8] hover:bg-[#1C2333] hover:text-[#F1F5F9] rounded-md transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="bg-[#111827] border-t border-[#2A3347] p-3 shrink-0 relative z-20">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="flex items-center space-x-2 bg-[#1C2333] border border-[#2A3347] rounded-xl pl-4 pr-1.5 py-1.5 focus-within:border-[#F59E0B] transition-colors"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your issue ID or ask..."
                className="flex-1 bg-transparent text-[#F1F5F9] text-sm outline-none placeholder-[#475569]"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0E1A] p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      {chatState === 'closed' && (
        <button 
          onClick={() => setChatState('open')}
          className="relative h-14 w-14 rounded-full bg-[#F59E0B] hover:bg-[#D97706] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 group"
          title="Track your issue"
          style={{ animation: 'pulseRing 2s infinite' }}
        >
          <MessageCircle className="h-6 w-6 text-[#0A0E1A]" />
          {hasUnresolved && (
            <span className="absolute top-0 right-0 h-3 w-3 bg-[#EF4444] rounded-full border-2 border-[#0A0E1A]"></span>
          )}
        </button>
      )}

    </div>
  );
};

export default Chatbot;
