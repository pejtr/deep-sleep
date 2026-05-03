import { useState, useEffect } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { getSessionId, getChronotype } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export function ChatPage() {
  const [, navigate] = useLocation();
  const sessionId = getSessionId();
  const chronotype = getChronotype();

  const [messages, setMessages] = useState<Message[]>([]);
  const [personaInfo, setPersonaInfo] = useState<{
    personaId: string;
    personaName: string;
    systemPrompt: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Assign persona on mount
  useEffect(() => {
    const assignPersona = async () => {
      if (!sessionId) return;

      try {
        const assignMutation = trpc.personas.assignPersona.useMutation();
        const result = await new Promise<any>((resolve, reject) => {
          assignMutation.mutate(
            {
              sessionId,
              page: "chatbot",
              chronotype: chronotype as "Lion" | "Bear" | "Wolf" | "Dolphin" | undefined,
            },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });

        if (result) {
          setPersonaInfo(result);

          // Initialize with system prompt and greeting
          if (result.systemPrompt) {
            const initialMessages: Message[] = [
              {
                role: "system",
                content: result.systemPrompt,
              },
              {
                role: "assistant",
                content: `Hi! I'm ${result.personaName}, your sleep guide. I'm here to help you transform your sleep and energy. What's on your mind today?`,
              },
            ];
            setMessages(initialMessages);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to assign persona:", error);
        setIsInitialized(true);
      }
    };

    assignPersona();
  }, []);

  const chatMutation = trpc.chat.message.useMutation({
    onSuccess: (response: { reply: string }) => {
      const text = response.reply;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: text,
        },
      ]);
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
    },
  });

  const handleSendMessage = (content: string) => {
    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);

    // Send to LLM
    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    
    chatMutation.mutate({
      message: content,
      history: history.length > 0 ? history : undefined,
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-spin text-accent" />
          <p className="text-muted-foreground">Connecting with your Luna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">
                {personaInfo?.personaName || "Chat"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your personalized sleep guide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AIChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
          placeholder="Ask me anything about your sleep..."
          height="600px"
          suggestedPrompts={[
            "What's my chronotype?",
            "How can I sleep better tonight?",
            "Tell me about the Deep Sleep Reset protocol",
            "What should I do before bed?",
          ]}
          emptyStateMessage={`Start a conversation with ${personaInfo?.personaName || "your Luna"}`}
        />
      </div>
    </div>
  );
}
