import { notification } from 'antd'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const rotatingMessages = [
  'Thinking',
  'Searching',
  'Reading',
  'Analyzing',
  'Processing',
  'Executing',
  'Fetching',
  'Computing',
  'Evaluating',
  'Synthesizing',
  'Understanding',
  'Reasoning'
]

const LoadingIndicator = ({ pendingRequestMessageId, pendingRequestUniqueId, sessionId }) => {
  const agentEventNotifications = useSelector(
    state => state.notifications.agentEvents?.data
  ) || []
  const { currentActiveSession } = useSelector(state => state.chat)

  // Get all matching agent events for this pendingMessageId
  const matchingEvents = agentEventNotifications?.filter(
    evt => (
      evt?.message_id === pendingRequestMessageId ||
      evt?.unique_id === pendingRequestUniqueId
    )
  ) || []

  // Select the last (most recent) matching event
  const lastMatchingEvent =
    matchingEvents.length > 0 ? matchingEvents[matchingEvents.length - 1] : null

  // State for rotating message
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(idx => (idx + 1) % rotatingMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Debug: Log key states and props (only run when primary props change)
  useEffect(() => {
    console.log('pendingRequestMessageId:', pendingRequestMessageId)
    console.log('sessionId:', sessionId)
    console.log('currentActiveSession:', currentActiveSession?.session_id)
    console.log('pendingRequestUniqueId:', pendingRequestUniqueId)
    console.log('agentEventNotifications count:', agentEventNotifications?.length)
  }, [pendingRequestMessageId, sessionId, currentActiveSession?.session_id, pendingRequestUniqueId, agentEventNotifications?.length])

  // If there is a pendingRequestMessageId and event, show event message
  if (pendingRequestMessageId || pendingRequestUniqueId) {
    if (!lastMatchingEvent) {
      // Show rotating loading message while waiting for matching event
      return (
        <div className="flex items-center space-x-2 p-2">
          <span className="text-gray-600 text-sm">{rotatingMessages[messageIndex]}</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )
    }
    const displayMessage =
      lastMatchingEvent.message || String(lastMatchingEvent)

    return (
      <div className="flex items-center space-x-2 p-2">
        <span className="text-gray-600 text-sm">{displayMessage}</span>
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    )
  }

  // If no pendingRequestMessageId, show rotating loading messages
  return (
    <div className="flex items-center space-x-2 p-2">
      <span className="text-gray-600 text-sm">
        {rotatingMessages[messageIndex]}
      </span>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 bg-[#505050] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}

export default LoadingIndicator