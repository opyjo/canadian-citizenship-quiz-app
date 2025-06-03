"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bot,
  User,
  Loader2,
  Search,
  AlertTriangle,
  BookOpen,
  Globe,
  Send,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  type?: "contextual_answer" | "web_answer" | "error";
}

// Helper function to format AI responses with better typography
const formatAIResponse = (content: string, type?: string) => {
  // Split content into paragraphs and format
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return paragraphs.map((paragraph, index) => {
    // Handle numbered lists (1., 2., etc.)
    if (/^\d+\./.test(paragraph.trim())) {
      const lines = paragraph.split("\n");
      return (
        <div key={index} className="space-y-2 sm:space-y-3 my-3 sm:my-4">
          {lines.map((line, lineIndex) => {
            if (/^\d+\./.test(line.trim())) {
              const match = line.match(/^(\d+\.)\s*(.*)$/);
              if (match) {
                const [, number, text] = match;
                // Parse bold text in the content
                const formattedText = formatInlineText(text);
                return (
                  <div
                    key={lineIndex}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {number.replace(".", "")}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      {formattedText}
                    </div>
                  </div>
                );
              }
            }
            return line.trim() ? (
              <p
                key={lineIndex}
                className="text-xs sm:text-sm leading-relaxed ml-7 sm:ml-9 text-gray-600"
              >
                {formatInlineText(line)}
              </p>
            ) : null;
          })}
        </div>
      );
    }

    // Handle bullet points
    if (paragraph.includes("•") || paragraph.includes("-")) {
      const lines = paragraph.split("\n");
      return (
        <div key={index} className="space-y-1.5 sm:space-y-2 my-3 sm:my-4">
          {lines.map((line, lineIndex) => {
            if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
              const cleanLine = line.replace(/^[•-]\s*/, "");
              return (
                <div
                  key={lineIndex}
                  className="flex items-start space-x-2 sm:space-x-3"
                >
                  <span className="text-red-500 font-bold mt-1 flex-shrink-0 text-xs sm:text-sm">
                    •
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1">
                    {formatInlineText(cleanLine)}
                  </span>
                </div>
              );
            }
            return line.trim() ? (
              <p
                key={lineIndex}
                className="text-xs sm:text-sm leading-relaxed ml-5 sm:ml-6 text-gray-600"
              >
                {formatInlineText(line)}
              </p>
            ) : null;
          })}
        </div>
      );
    }

    // Handle regular paragraphs
    return (
      <p
        key={index}
        className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 last:mb-0"
      >
        {formatInlineText(paragraph)}
      </p>
    );
  });
};

// Helper function to format inline text (bold, italics, etc.)
const formatInlineText = (text: string) => {
  // Split by bold markers (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    // Handle bold text
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {boldText}
        </strong>
      );
    }

    // Handle italic text (*text*)
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic text-gray-700">
          {italicText}
        </em>
      );
    }

    // Handle regular text, but also look for special patterns
    return formatSpecialPatterns(part, index);
  });
};

// Helper function to format special patterns like notes, disclaimers, etc.
const formatSpecialPatterns = (text: string, key: number) => {
  // Handle notes and disclaimers (lines starting with *Note:)
  if (text.includes("*Note:")) {
    return (
      <span
        key={key}
        className="block mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md"
      >
        <span className="text-blue-800 text-sm italic">
          {text.replace("*Note:", "📝 Note:")}
        </span>
      </span>
    );
  }

  // Regular text
  return <span key={key}>{text}</span>;
};

export default function AiQaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "ai",
      content:
        "Hello! I'm here to help you study for the Canadian citizenship test. Ask me any questions about the 'Discover Canada' guide.",
      type: "contextual_answer",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (hasUserInteracted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, hasUserInteracted]);

  const fetchAIResponse = async (question: string) => {
    setIsLoading(true);
    const aiLoadingMessageId = uuidv4();

    // Add a temporary loading message
    setMessages((prev) => [
      ...prev,
      {
        id: aiLoadingMessageId,
        role: "ai",
        content: "Thinking...",
        type: "contextual_answer",
      },
    ]);

    try {
      const response = await fetch("/api/ask-discover-canada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to get an answer (status: ${response.status}).`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.details || errorData.error || errorMsg;
        } catch (parseError) {
          const textError = await response.text();
          errorMsg = `Server error: ${response.status} ${
            response.statusText
          }. Response: ${textError.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Update the loading message with the actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiLoadingMessageId
            ? {
                id: msg.id,
                role: "ai",
                content: data.content,
                type: data.type,
              }
            : msg
        )
      );
    } catch (err) {
      const errorContent =
        err instanceof Error ? err.message : "An unknown error occurred.";

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiLoadingMessageId
            ? { id: msg.id, role: "ai", content: errorContent, type: "error" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question) return;

    // Set that user has interacted, enabling auto-scroll for subsequent messages
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: "user", content: question },
    ]);
    setInputValue("");
    await fetchAIResponse(question);
  };

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col px-2 sm:px-4 lg:px-8">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-2 sm:py-4 lg:py-8">
        <Card className="flex-1 flex flex-col shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm overflow-hidden min-h-[calc(100vh-12rem)]">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white flex-shrink-0 p-4 sm:p-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <div className="relative">
                <Bot className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="truncate">Discover Canada AI Assistant</span>
            </CardTitle>
            <CardDescription className="text-red-100 text-sm sm:text-base mt-1">
              Get instant answers from the official "Discover Canada" study
              guide
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3 sm:p-4 lg:p-6 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 lg:space-y-6 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`transform transition-all duration-500 ease-out ${
                    index === messages.length - 1
                      ? "animate-in slide-in-from-bottom-3"
                      : ""
                  } ${
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[95%] sm:max-w-[85%] transition-all duration-300 hover:shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl rounded-br-md shadow-lg"
                        : msg.type === "error"
                        ? "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-2 border-red-200 rounded-2xl rounded-bl-md shadow-md"
                        : "bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-md hover:shadow-xl"
                    }`}
                  >
                    {/* Message Header for AI responses */}
                    {msg.role === "ai" && msg.type !== "error" && (
                      <div className="flex items-center justify-between px-3 sm:px-4 pt-2 sm:pt-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            AI Assistant
                          </span>
                          {msg.type === "contextual_answer" && (
                            <div className="flex items-center space-x-1 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                              <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                              <span className="text-xs text-green-700 font-medium hidden sm:inline">
                                Official Guide
                              </span>
                              <span className="text-xs text-green-700 font-medium sm:hidden">
                                Official
                              </span>
                            </div>
                          )}
                          {msg.type === "web_answer" && (
                            <div className="flex items-center space-x-1 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                              <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                              <span className="text-xs text-blue-700 font-medium hidden sm:inline">
                                General Knowledge
                              </span>
                              <span className="text-xs text-blue-700 font-medium sm:hidden">
                                General
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div
                      className={`p-3 sm:p-4 ${
                        msg.role === "ai" && msg.type !== "error"
                          ? "pt-2 sm:pt-3"
                          : ""
                      }`}
                    >
                      {msg.role === "user" && (
                        <div className="flex items-start space-x-2 mb-2">
                          <User className="h-4 w-4 mt-0.5 opacity-90 flex-shrink-0" />
                          <span className="text-xs font-medium opacity-90 uppercase tracking-wide">
                            You
                          </span>
                        </div>
                      )}

                      {msg.type === "error" && (
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-red-700">
                            Error
                          </span>
                        </div>
                      )}

                      <div
                        className={`${
                          msg.role === "user"
                            ? "text-white font-medium text-sm sm:text-base"
                            : msg.type === "error"
                            ? "text-red-800 text-sm"
                            : "text-gray-800 text-sm"
                        }`}
                      >
                        {msg.role === "ai" && msg.type !== "error" ? (
                          <div className="prose prose-sm max-w-none">
                            {formatAIResponse(msg.content, msg.type)}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`px-3 sm:px-4 pb-2 text-xs ${
                        msg.role === "user" ? "text-red-200" : "text-gray-400"
                      }`}
                    >
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced Loading Indicator */}
              {isLoading && messages[messages.length - 1]?.role !== "ai" && (
                <div className="flex justify-start animate-in slide-in-from-bottom-3">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-md p-3 sm:p-4 max-w-[75%] sm:max-w-xs">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="relative">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 ml-2">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Form */}
            <div className="flex-shrink-0 mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-end space-x-2 sm:space-x-3 bg-gray-50 rounded-2xl p-2 border-2 border-transparent focus-within:border-red-300 focus-within:bg-white transition-all duration-200">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about Canadian citizenship..."
                    disabled={isLoading}
                    className="flex-grow border-0 bg-transparent text-gray-800 placeholder-gray-500 focus:ring-0 text-sm sm:text-base py-2 sm:py-3 min-h-[44px]"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl px-3 sm:px-6 py-2 sm:py-2 min-h-[44px] min-w-[44px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform active:scale-95 sm:hover:scale-105"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="font-medium hidden sm:inline">
                          Send
                        </span>
                        <Send className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Helpful Tips */}
              <div className="mt-2 sm:mt-3 text-center px-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  💡 Try asking about{" "}
                  <span className="font-medium text-red-600">
                    citizenship requirements
                  </span>
                  {", "}
                  <span className="font-medium text-red-600">
                    Canadian history
                  </span>
                  {", or "}
                  <span className="font-medium text-red-600">
                    government structure
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
