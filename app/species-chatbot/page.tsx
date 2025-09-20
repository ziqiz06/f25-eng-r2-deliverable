/* eslint-disable */
"use client";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function SpeciesChatbot() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return;

    // Add user message to chat log
    setChatLog((prev) => [...prev, { role: "user", content: message }]);
    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Replace with your actual domain
          "X-Title": "Species Chatbot",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      });

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: any = await response.json();
      const botMessage = data?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a response.";

      // Add bot reply to chat log
      setChatLog((prev) => [...prev, { role: "bot", content: botMessage }]);
    } catch (error) {
      console.error(error);
      const errorMessage = "There was an error fetching the response.";
      setChatLog((prev) => [...prev, { role: "bot", content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TypographyH2>Species Chatbot</TypographyH2>
      <div className="mt-4 flex gap-4">
        <div className="mt-4 rounded-lg bg-foreground p-4 text-background">
          <TypographyP>
            The Species Chatbot is a feature to be implemented that is specialized to answer questions about animals.
            Ideally, it will be able to provide information on various species, including their habitat, diet,
            conservation status, and other relevant details. Any unrelated prompts will return a message to the user
            indicating that the chatbot is specialized for species-related queries only.
          </TypographyP>
          <TypographyP>
            To use the Species Chatbot, simply type your question in the input field below and hit enter. The chatbot
            will respond with the best available information.
          </TypographyP>
        </div>
      </div>
      {/* Chat UI, ChatBot to be implemented */}
      <div className="mx-auto mt-6">
        {/* Chat history */}
        <div className="h-[400px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted p-4">
          {chatLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start chatting about a species!</p>
          ) : (
            chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none border border-border bg-foreground text-primary-foreground"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Textarea and submission */}
        <div className="mt-4 flex flex-col items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleInput}
            rows={1}
            placeholder="Ask about a species..."
            className="w-full resize-none overflow-hidden rounded border border-border bg-background p-2 text-sm text-foreground focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isLoading}
            className="mt-2 rounded bg-primary px-4 py-2 text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Enter"}
          </button>
        </div>
      </div>
    </>
  );
}
