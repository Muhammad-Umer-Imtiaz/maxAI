'use client'

import { Button } from '@/app/(frontend)/components/ui/button'
import { vapi } from '@/app/(frontend)/lib/vapi'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import MaleImage from '@/app/(frontend)/assets/male.png'
import FemaleImage from '@/app/(frontend)/assets/female.png'
import Image from 'next/image'

const AiAssistantPage = () => {
  const [callActive, setCallActive] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [callEnded, setCallEnded] = useState(false)
  // ✅ COMMENTED OUT: Call limit functionality for testing
  // const [canMakeCall, setCanMakeCall] = useState(true)
  // const [callLimitMessage, setCallLimitMessage] = useState('')
  const [canMakeCall, setCanMakeCall] = useState(true) // Always allow calls for testing
  const [callLimitMessage, setCallLimitMessage] = useState('')

  const { user } = useAuth()
  const router = useRouter()
  const messageContainerRef = useRef<HTMLDivElement>(null)

  // ✅ COMMENTED OUT: Function to check if user can make AI calls based on maxAiCalls field
  /*
  const checkCallLimit = () => {
    if (!user) {
      setCanMakeCall(false)
      setCallLimitMessage('Please log in to use AI assistant')
      return false
    }

    const currentCalls = user.aiCallsUsed || 0
    const maxCalls = user.maxAiCalls || 1 // Default to 1 for free plan

    if (maxCalls === -1) {
      // Unlimited calls (for maxFlex)
      setCanMakeCall(true)
      setCallLimitMessage('')
      return true
    }

    if (currentCalls >= maxCalls) {
      setCanMakeCall(false)
      const remainingCalls = Math.max(0, maxCalls - currentCalls)
      setCallLimitMessage(
        `You've used ${currentCalls} of ${maxCalls} AI calls. ${
          remainingCalls === 0
            ? 'Please upgrade your plan to get more calls.'
            : `You have ${remainingCalls} calls remaining.`
        }`,
      )
      return false
    }

    setCanMakeCall(true)
    setCallLimitMessage('')
    return true
  }
  */

  // ✅ COMMENTED OUT: Function to increment aiCallsUsed (for testing)
  /*
  const incrementAiCallsUsed = async () => {
    try {
      if (!user?.email) {
        console.error('No user email available to increment AI calls')
        return
      }

      const response = await fetch('/api/users/increment-ai-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to increment AI calls:', errorData)
      }
    } catch (error) {
      console.error('Error incrementing AI calls:', error)
    }
  }
  */

  // Silence known error
  useEffect(() => {
    const originalError = console.error
    console.error = function (msg, ...args) {
      if (
        msg?.includes?.('Meeting has ended') ||
        args[0]?.toString?.().includes?.('Meeting has ended')
      ) {
        return
      }
      return originalError.call(console, msg, ...args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      return () => clearTimeout(redirectTimer)
    }
  }, [callEnded, router])

  // ✅ COMMENTED OUT: Check call limit when user data changes
  /*
  useEffect(() => {
    checkCallLimit()
  }, [user])
  */

  useEffect(() => {
    const handleCallStart = () => {
      console.log('📞 Call started')
      setConnecting(false)
      setCallActive(true)
      setCallEnded(false)
    }

    const handleCallEnd = () => {
      console.log('📞 Call ended')
      setCallActive(false)
      setConnecting(false)
      setIsSpeaking(false)
      setCallEnded(true)
      // ✅ COMMENTED OUT: AI call increment for testing
      // incrementAiCallsUsed?.()
    }

    const handleSpeechStart = () => setIsSpeaking(true)
    const handleSpeechEnd = () => setIsSpeaking(false)

    const handleMessage = (message: any) => {
      console.log('📨 Received message:', message) // Add this for debugging

      // Handle transcript messages (ONLY final transcripts to avoid duplicates)
      if (
        message.type === 'transcript' &&
        message.transcriptType === 'final' &&
        message.transcript
      ) {
        const newMessage = {
          content: message.transcript,
          role: message.role || 'assistant',
        }
        setMessages((prev) => [...prev, newMessage])
      }

      // Handle other message types that might contain conversation content
      else if (message.type === 'function-call' && message.functionCall) {
        console.log('🔧 Function call:', message.functionCall)
      }

      // Handle any other message types with text content
      else if (message.message || message.content || message.text) {
        const content = message.message || message.content || message.text
        const newMessage = {
          content: content,
          role: message.role || 'assistant',
        }
        setMessages((prev) => [...prev, newMessage])
      }

      // Log unhandled messages for debugging
      else {
        console.log('🤷 Unhandled message type:', message.type, message)
      }
    }

    const handleError = (error: any) => {
      console.error('❌ VAPI Error:', error)
      setConnecting(false)
      setCallActive(false)
    }

    vapi
      .on('call-start', handleCallStart)
      .on('call-end', handleCallEnd)
      .on('speech-start', handleSpeechStart)
      .on('speech-end', handleSpeechEnd)
      .on('message', handleMessage)
      .on('error', handleError)

    return () => {
      vapi
        .off('call-start', handleCallStart)
        .off('call-end', handleCallEnd)
        .off('speech-start', handleSpeechStart)
        .off('speech-end', handleSpeechEnd)
        .off('message', handleMessage)
        .off('error', handleError)
    }
  }, [])

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop()
    } else {
      try {
        setConnecting(true)
        setMessages([]) // reset conversation at call start
        setCallEnded(false)

        // hard-coded voices from your Vapi dashboard
        const maleVoiceId = 'Elliot'
        const femaleVoiceId = 'Paige'

        // pick voice based on user gender if available (handle type safely)
        const voiceId =
          (user as any)?.gender?.toLowerCase() === 'female' ? femaleVoiceId : maleVoiceId

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          voice: {
            voiceId: voiceId, // 👈 this matches your config JSON key
            provider: 'vapi', // 👈 since you're using Vapi-hosted voices
          },
          variableValues: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest',
            email: user?.email || 'anonymous',
            firstName: user?.firstName || 'Guest',
            lastName: user?.lastName || '',
            gender: (user as any)?.gender || 'male',
          },
        })
      } catch (error) {
        console.error('❌ Failed to start VAPI call:', error)
        setConnecting(false)
      }
    }
  }

  return (
    <RequirePlanAccess>
      <div className="bg-hero-gradient min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--color-maxfit-neon-green)) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, hsl(var(--color-maxfit-neon-green)) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-6xl">
          {/* HEADER SECTION */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-maxfit-darker-grey/60 backdrop-blur-sm border border-maxfit-neon-green/20 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-maxfit-neon-green rounded-full animate-pulse"></div>
              <span className="text-maxfit-neon-green text-sm font-medium">
                AI-Powered Fitness Coach
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-4">
              <span className="text-maxfit-white">Generate Your </span>
              <span className="text-glow bg-accent-gradient bg-clip-text text-transparent">
                Fitness Program
              </span>
            </h1>

            <p className="text-maxfit-medium-grey text-lg max-w-2xl mx-auto leading-relaxed">
              Have a voice conversation with our AI assistant to create your personalized workout
              and nutrition plan
            </p>
          </div>

          {/* DEBUG MESSAGES COUNT */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
              Messages: {messages.length} | Call: {callActive ? 'Active' : 'Inactive'} | Speaking:{' '}
              {isSpeaking ? 'Yes' : 'No'}
            </div>
          )}

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* AI ASSISTANT CARD */}
            <div className="glass-card rounded-2xl p-8 hover-lift relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/5 to-transparent opacity-50"></div>

              <div className="relative flex flex-col items-center text-center">
                {/* AI Avatar with dynamic effects */}
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isSpeaking
                        ? 'bg-maxfit-neon-green/20 scale-125 animate-pulse'
                        : callActive
                          ? 'bg-maxfit-neon-green/10 scale-110'
                          : 'bg-maxfit-darker-grey/30'
                    }`}
                    style={{
                      boxShadow: isSpeaking ? 'var(--shadow-glow)' : 'none',
                    }}
                  ></div>

                  <div className="relative w-32 h-32 rounded-full bg-card-gradient border-2 border-maxfit-neon-green/30 flex items-center justify-center overflow-hidden">
                    <Image
                      src={
                        (user as any)?.gender?.toLowerCase() === 'female' ? FemaleImage : MaleImage
                      }
                      alt="AI Avatar"
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                  </div>

                  {/* Pulse rings when speaking */}
                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-full border-2 border-maxfit-neon-green animate-ping"></div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-maxfit-white mb-2">
                  MaxFIT<span className="text-maxfit-neon-green">AI</span>
                </h2>
                <p className="text-maxfit-medium-grey mb-6">Your Personal Fitness & Diet Coach</p>

                {/* Status Indicator */}
                <div
                  className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-maxfit-neon-green/20 border-maxfit-neon-green/50'
                      : callActive
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : callEnded
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-maxfit-darker-grey/50 border-maxfit-darker-grey'
                  } border`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      isSpeaking
                        ? 'bg-maxfit-neon-green animate-pulse'
                        : callActive
                          ? 'bg-blue-500 animate-pulse'
                          : callEnded
                            ? 'bg-green-500'
                            : 'bg-maxfit-medium-grey'
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-maxfit-white">
                    {isSpeaking
                      ? '🎤 Speaking...'
                      : callActive
                        ? '👂 Listening...'
                        : callEnded
                          ? '✅ Session Complete'
                          : '⏳ Ready to Start'}
                  </span>
                </div>
              </div>
            </div>

            {/* USER CARD */}
            <div className="glass-card rounded-2xl p-8 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50"></div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-card-gradient border-2 border-maxfit-medium-grey/30 flex items-center justify-center overflow-hidden">
                    <div className="w-20 h-20 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-maxfit-neon-green">
                        {user?.firstName?.charAt(0)?.toUpperCase() || '👤'}
                      </span>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-maxfit-white mb-2">You</h2>
                <p className="text-maxfit-medium-grey mb-6">
                  {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Fitness Enthusiast'}
                </p>

                <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-maxfit-darker-grey/50 border border-maxfit-darker-grey">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-maxfit-white">
                    💪 Ready to Transform
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ COMMENTED OUT: CALL LIMIT MESSAGE */}
          {/*
          {!canMakeCall && callLimitMessage && (
            <div className="flex justify-center mb-8">
              <div className="glass-card rounded-2xl p-6 max-w-2xl text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-maxfit-white mb-2">Call Limit Reached</h3>
                  <p className="text-maxfit-medium-grey mb-4">{callLimitMessage}</p>
                  <Button onClick={() => router.push('/#pricing')} className="btn-neon">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
          */}

          {/* CONVERSATION MESSAGES - Always show when call is active or messages exist */}
          {(callActive || messages.length > 0) && (
            <div className="glass-card rounded-2xl p-6 mb-8 max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-maxfit-white">Live Conversation</h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${callActive ? 'bg-maxfit-neon-green animate-pulse' : 'bg-gray-500'}`}
                  ></div>
                  <span className="text-xs text-maxfit-medium-grey">
                    {callActive ? 'Live Session' : 'Session Ended'} ({messages.length} messages)
                  </span>
                </div>
              </div>

              <div
                ref={messageContainerRef}
                className="space-y-4 overflow-y-auto pr-2 max-h-72"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--color-maxfit-neon-green)) transparent',
                }}
              >
                {messages.length === 0 && callActive && (
                  <div className="text-center py-8">
                    <div className="text-maxfit-medium-grey text-sm">
                      Conversation will appear here as you speak...
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'assistant' ? 'bg-maxfit-darker-grey/60 text-maxfit-white border-l-4 border-maxfit-neon-green' : 'bg-accent-gradient text-maxfit-black'} ${msg.isPartial ? 'opacity-70 italic' : ''}`}
                    >
                      <div className="text-xs font-semibold mb-2 opacity-70 flex items-center justify-between">
                        <span>{msg.role === 'assistant' ? '🤖 MaxFIT AI' : '👤 You'}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {callEnded && (
                  <div className="flex justify-center">
                    <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-2xl text-center">
                      <div className="text-xs font-semibold mb-2">✅ System</div>
                      <p className="text-sm">
                        Your fitness program has been created! Redirecting to your dashboard...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CALL ACTION BUTTON */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Glow effect for active states */}
              {(callActive || connecting) && (
                <div className="absolute inset-0 bg-maxfit-neon-green/20 rounded-full blur-xl animate-pulse"></div>
              )}

              <Button
                onClick={toggleCall}
                disabled={connecting || callEnded} // ✅ Removed !canMakeCall condition
                className={`relative px-12 py-6 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 ${
                  // ✅ Removed !canMakeCall condition from styling
                  callActive
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                    : connecting
                      ? 'bg-yellow-600 text-maxfit-black cursor-not-allowed'
                      : callEnded
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'btn-neon'
                }`}
              >
                {connecting && (
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-maxfit-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <span className={connecting ? 'ml-8' : ''}>
                  {/* ✅ Removed !canMakeCall condition from button text */}
                  {connecting
                    ? 'Connecting...'
                    : callActive
                      ? '🛑 End Call'
                      : callEnded
                        ? '📊 View Dashboard'
                        : '🎯 Start Your Journey'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RequirePlanAccess>
  )
}

export default AiAssistantPage
