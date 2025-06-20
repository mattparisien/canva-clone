"use client"

import { EnhancedChatbot } from "@components/ui/enhanced-chatbot"
import { Bot, Sparkles, MessageSquare, Search, PlusCircle } from "lucide-react"

export default function AssistantPage() {
  const handleProjectCreated = (projectData: any) => {
    console.log('Project created:', projectData)
    // Handle project creation logic here
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600 mt-1">Your intelligent design companion</p>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Project Creation</h3>
              </div>
              <p className="text-sm text-gray-600">Generate new projects with AI assistance</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Web Search</h3>
              </div>
              <p className="text-sm text-gray-600">Search the web for inspiration and resources</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Smart Assistance</h3>
              </div>
              <p className="text-sm text-gray-600">Get intelligent help with your design workflow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl h-full">
          <EnhancedChatbot
            trigger={
              <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Start a Conversation</h2>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-4">Click anywhere to start chatting with your AI assistant</p>
                      <div className="text-sm text-gray-500">
                        Ask me about projects, search the web, or get design help
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            initialMessage="Hello! I'm your AI assistant. How can I help you today?"
            enableWebSearch={true}
            enableProjectCreation={true}
            onProjectCreated={handleProjectCreated}
          />
        </div>
      </div>
    </div>
  )
}
