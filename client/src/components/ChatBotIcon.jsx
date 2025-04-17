import React, { useState } from 'react'
import { FaComments } from 'react-icons/fa'
import ChatBot from './ChatBot'
import ChatBox from './ChatBox'

const ChatBotIcon = () => {
    const [chatOpen, setChatOpen] = useState(false)
    const handleChatToggle = () => {
        setChatOpen(!chatOpen) 
    }
    
    return (
        <div>
            <div className="fixed bottom-6 right-6 z-50 ">
                <button
                    className="bg-[#6366f1] hover:bg-blue-700 text-white p-4 rounded-full shadow-lg 
                    transform transition-transform duration-200 hover:scale-110 active:scale-95"
                    onClick={handleChatToggle}
                >
                    <FaComments size={28} />
                </button>
            </div>

            <div className={`fixed bottom-24 right-6  bg-white border rounded-xl shadow-2xl 
              w-[400px]
                transform transition-all duration-300 origin-bottom-right
                ${chatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            >
                <div className="bg-[#6366f1] text-white p-4 rounded-t-xl">
                    <h3 className="text-lg font-semibold"> Trek Sathi AI </h3>
                </div>
                
                <div className="p-4">
                    <div className="h-[400px] overflow-y-auto pr-2 
                  
                        scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-100">
                        <ChatBot />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBotIcon