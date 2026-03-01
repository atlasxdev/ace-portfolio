"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DATA } from "@/data/resume";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi there! Thanks for stopping by my website 😊 Feel free to ask me anything about web development or programming. I’m happy to help—just let me know!",
    },
  ]);
  const [inputValue, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.content,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-87.5 sm:w-100 overflow-hidden shadow-2xl will-change-transform">
            <Card className="border-border/50 bg-card shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-primary text-primary-foreground rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-9 border-2 border-primary-foreground/20">
                      <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                      <AvatarFallback>{DATA.initials}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-primary rounded-full"></span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Chat with {DATA.name.split(" ")[0]}</CardTitle>
                    <p className="text-[10px] text-primary-foreground/70">AI Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-full"
                  onClick={toggleChat}>
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-100 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-muted">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        message.role === "assistant"
                          ? "bg-muted text-foreground rounded-tl-none whitespace-pre-wrap"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </CardContent>
              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                  <input
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    value={inputValue}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="size-8 rounded-full shrink-0"
                    disabled={!inputValue.trim() || isLoading}>
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={toggleChat}
          size="lg"
          className="rounded-full size-14 shadow-xl flex items-center justify-center p-0 border-2 border-primary/20 overflow-hidden">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}>
                <X className="size-6 text-primary-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="size-6 text-primary-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
