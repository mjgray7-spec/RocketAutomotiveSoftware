import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  Image as ImageIcon,
  Paperclip,
  Calendar,
  Wrench,
  Users,
  FileText
} from "lucide-react";

const SUGGESTED_ACTIONS = [
  { label: "Draft Estimate for Smith RO", icon: FileText },
  { label: "Check Inventory for Oil Filters", icon: Wrench },
  { label: "Schedule Alignment for Tesla", icon: Calendar },
  { label: "Send Follow-up to Inactive Customers", icon: Users },
];

const MOCK_CHAT_HISTORY = [
  { id: 1, sender: "bot", content: "Hello! I'm your ROcket AI assistant. I can help you manage appointments, create estimates, check inventory, or analyze shop performance. What can I do for you today?", timestamp: "08:00 AM" },
  { id: 2, sender: "user", content: "Can you check if we have brake pads for a 2018 Ford F-150 in stock?", timestamp: "08:05 AM" },
  { id: 3, sender: "bot", content: "I checked our inventory and the local vendor network.\n\n**Internal Inventory:** 0 sets in stock.\n**NAPA Auto Parts:** 4 sets available (Part #AD-7854), delivery by 10:30 AM today.\n\nWould you like me to order a set from NAPA?", timestamp: "08:05 AM" },
];

export default function AIAgent() {
  const [input, setInput] = useState("");

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold font-display">ROcket AI Agent</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online & Ready
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-3 w-3" /> Clear History
            </Button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {MOCK_CHAT_HISTORY.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className={`h-8 w-8 ${msg.sender === "bot" ? "bg-primary/10" : "bg-secondary"}`}>
                    {msg.sender === "bot" ? (
                      <div className="h-full w-full flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
                    ) : (
                      <AvatarFallback>U</AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted/50 border border-border/50 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Suggested Actions */}
          <div className="p-4 pt-0">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {SUGGESTED_ACTIONS.map((action, i) => (
                <Button key={i} variant="outline" size="sm" className="whitespace-nowrap bg-background hover:bg-muted/50 text-xs h-8 border-dashed">
                  <action.icon className="mr-2 h-3 w-3 text-muted-foreground" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-background">
            <div className="relative flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about shop operations, parts, or schedules..." 
                className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 h-10 px-2"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90 text-white shrink-0 rounded-lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-2">
              ROcket AI can make mistakes. Please verify critical repair data.
            </div>
          </div>
        </div>

        {/* Right Sidebar - Context/Active Tasks */}
        <div className="hidden xl:flex w-80 flex-col gap-4">
          <Card className="flex-1 border-border/50 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Active Context</h3>
              
              <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Current Focus</div>
                <div className="font-bold text-sm">2018 Ford F-150 (RO #1024)</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] h-5">Brake Job</Badge>
                  <Badge variant="outline" className="text-[10px] h-5">Parts Needed</Badge>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Recent Activity</div>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Ordered Oil Filter (NAPA)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Updated Estimate #1025
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Flagged delay on Bay 2
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
