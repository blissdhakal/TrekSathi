import ChatBox from "./ChatBox";
import { useState, useEffect, useRef } from "react";
import { gemini } from "@/lib/constant";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, X } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const genAI = new GoogleGenerativeAI(gemini);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    const initialChat = model.startChat();
    setChat(initialChat);
  }, []);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !chat) return;

    try {
      setIsLoading(true);

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(",")[1];
          // Create message parts array with both image and text if present
          const messageParts = [
            {
              inlineData: {
                data: base64Data,
                mimeType: selectedFile.type
              }
            }
          ];
          
          // Add text part if message exists
          if (message.trim()) {
            messageParts.push({ text: message });
          }

          // Add the user message with all parts
          const userMessage = {
            role: "user",
            parts: messageParts
          };
          setMessages(prev => [...prev, userMessage]);

          // Process the image and text with the AI
          const result = await model.generateContent([
            {
              inlineData: {
                data: base64Data,
                mimeType: selectedFile.type,
              },
            },
            message || "Describe this file.",
          ]);
          const response = result.response;
          setMessages((prev) => [
            ...prev,
            { role: "model", parts: [{ text: response.text() }] },
          ]);
          setSelectedFile(null);
          setMessage("");
        };
        reader.readAsDataURL(selectedFile);
      } else if (message.trim()) {
        // Text-only message
        const userMessage = { 
          role: "user", 
          parts: [{ text: message }] 
        };
        setMessages(prev => [...prev, userMessage]);

        const result = await model.generateContent(message);
        const response = await result.response;
        
        setMessages(prev => [
          ...prev,
          { role: "model", parts: [{ text: response.text() }] },
        ]);
        
        setMessage("");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Sorry, an error occurred." }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
    <ChatBox history={messages} />
    <Card className="border-t">
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span>{selectedFile.name}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button 
              type="button"
              size="sm" 
              variant="ghost"
              onClick={handleFileClick}
              disabled={isLoading}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="bg-[#6366f1] hover:bg-blue-700">
              <Send className="h-4 w-4 " />
            </Button>
          </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBot;