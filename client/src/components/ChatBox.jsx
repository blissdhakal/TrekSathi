import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaComments } from "react-icons/fa";

const ChatBox = ({ history = [] }) => {
  const renderMessageContent = (message) => {
    return (
      <div className="space-y-1.5"> 
        {message.parts.map((part, index) => {
          if (part.inlineData) {
            const { data, mimeType } = part.inlineData;
            return (
              <img
                key={index}
                src={`data:${mimeType};base64,${data}`}
                alt="User uploaded image"
                className="max-w-full h-auto rounded-md"
              />
            );
          }
          if (part.text) {
            return <div key={index} className="text-sm">{part.text}</div>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <Card className="w-full h-[321px] flex flex-col">
      <ScrollArea className="flex-1 p-3">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500">
            <FaComments size={24} className="text-gray-400" />
            <p className="text-sm font-medium">How can Trek Sathi help you today?</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-1.5 max-w-[75%] ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  } ${message.parts.some(part => part.inlineData) ? "p-1" : ""}`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ChatBox;