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
import { Bot, User, Loader2, Search, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // For unique message IDs

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  type?: "contextual_answer" | "needs_web_search" | "web_answer" | "error";
  originalQuestionForWebSearch?: string; // Store the question if web search is offered
}

export default function AiQaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "ai",
      content: "Hello! Ask me questions about the 'Discover Canada' guide.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track if user has sent a message
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Only scroll if the user has interacted (sent a message)
    if (hasUserInteracted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // Use "nearest" instead of default "start" to prevent excessive page scrolling
        inline: "nearest",
      });
    }
  };

  useEffect(scrollToBottom, [messages, hasUserInteracted]);

  const fetchAIResponse = async (
    currentQuestion: string,
    searchMode: "context" | "web",
    isWebSearchContinuation = false,
    originalMessageIdToUpdate?: string // Added to target the message for web search update
  ) => {
    setIsLoading(true);
    const aiLoadingMessageId = uuidv4(); // ID for the AI loading message or final AI response

    if (!isWebSearchContinuation) {
      // Add a temporary loading message for AI for a new question
      setMessages((prev) => [
        ...prev,
        {
          id: aiLoadingMessageId,
          role: "ai",
          content: "Thinking...",
          type: "contextual_answer",
        },
      ]);
    } else if (originalMessageIdToUpdate) {
      // If it's a web search continuation, update the existing "needs_web_search" message to show loading
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === originalMessageIdToUpdate
            ? {
                ...msg,
                content: "Searching the web...",
                type: "contextual_answer",
              } // Change type to avoid re-showing button
            : msg
        )
      );
    }

    try {
      const response = await fetch("/api/ask-discover-canada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, searchMode }),
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

      if (isWebSearchContinuation && originalMessageIdToUpdate) {
        // Update the message that initially offered the web search
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === originalMessageIdToUpdate
              ? {
                  id: msg.id,
                  role: "ai",
                  content: data.content,
                  type: data.type,
                  originalQuestionForWebSearch: undefined,
                }
              : msg
          )
        );
      } else {
        // Update the placeholder AI message for a new question, or add if it wasn't a continuation
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id === aiLoadingMessageId) {
              // This ID was for the initial loading message
              if (data.type === "needs_web_search") {
                return {
                  id: msg.id,
                  role: "ai",
                  content: data.message,
                  type: "needs_web_search",
                  originalQuestionForWebSearch: currentQuestion,
                };
              } else if (
                data.type === "contextual_answer" ||
                data.type === "web_answer"
              ) {
                return {
                  id: msg.id,
                  role: "ai",
                  content: data.content,
                  type: data.type,
                };
              }
            }
            return msg;
          })
        );
      }
    } catch (err) {
      const errorContent =
        err instanceof Error ? err.message : "An unknown error occurred.";
      if (isWebSearchContinuation && originalMessageIdToUpdate) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === originalMessageIdToUpdate
              ? {
                  ...msg,
                  role: "ai",
                  content: errorContent,
                  type: "error",
                  originalQuestionForWebSearch: undefined,
                }
              : msg
          )
        );
      } else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiLoadingMessageId // Target the initial loading message ID for error update
              ? { id: msg.id, role: "ai", content: errorContent, type: "error" }
              : msg
          )
        );
      }
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
    await fetchAIResponse(question, "context");
  };

  const handleSearchWeb = async (
    originalQuestion: string,
    messageIdToUpdate: string
  ) => {
    if (!originalQuestion) return;
    // No need to set loading message here, fetchAIResponse will handle it based on originalMessageIdToUpdate
    await fetchAIResponse(originalQuestion, "web", true, messageIdToUpdate);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      {" "}
      {/* Added my-8 for some spacing */}
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-6 w-6 text-red-600" />
          Discover Canada AI Chat
        </CardTitle>
        <CardDescription>
          Ask questions about the "Discover Canada" guide.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100vh-250px)] min-h-[400px]">
        {" "}
        {/* Adjusted height */}
        <div className="flex-grow space-y-4 overflow-y-auto p-4 border rounded-md mb-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  msg.role === "user"
                    ? "bg-red-600 text-white"
                    : msg.type === "error"
                    ? "bg-red-100 text-red-800 border border-red-300" // Changed error color for better contrast
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.role === "ai" && msg.type !== "error" && (
                  <Bot className="h-5 w-5 inline mr-2 mb-1 text-red-500 flex-shrink-0" />
                )}{" "}
                {/* Added flex-shrink-0 */}
                {msg.role === "user" && (
                  <User className="h-5 w-5 inline mr-2 mb-1 flex-shrink-0" />
                )}{" "}
                {/* Added flex-shrink-0 */}
                {msg.type === "error" && (
                  <AlertTriangle className="h-5 w-5 inline mr-2 mb-1 text-red-600 flex-shrink-0" />
                )}{" "}
                {/* Changed error icon color */}
                <span className="whitespace-pre-wrap break-words">
                  {msg.content}
                </span>{" "}
                {/* Added break-words */}
                {msg.type === "needs_web_search" &&
                  msg.originalQuestionForWebSearch && (
                    <Button
                      onClick={() =>
                        handleSearchWeb(
                          msg.originalQuestionForWebSearch!,
                          msg.id
                        )
                      }
                      disabled={isLoading} // Disable button while any loading is happening
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2"
                      size="sm"
                    >
                      <Search className="mr-1 h-3 w-3" /> Search the Web
                    </Button>
                  )}
              </div>
            </div>
          ))}
          {/* Combined loading indicator logic */}
          {isLoading && messages[messages.length - 1]?.role !== "ai" && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-white text-gray-800 border border-gray-200 shadow-sm">
                <Bot className="h-5 w-5 inline mr-2 mb-1 text-red-500 flex-shrink-0" />
                <Loader2 className="h-5 w-5 animate-spin inline" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 pt-4 border-t"
        >
          {" "}
          {/* Added border-t and pt-4 */}
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
