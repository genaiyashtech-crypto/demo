import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDown, ChevronUp, Brain, Lightbulb, Sparkles } from 'lucide-react'

const ThinkingIndicator = ({ pendingRequestMessageId, pendingRequestUniqueId, sessionId }) => {
    const [isExpanded, setIsExpanded] = useState(true)

    const agentReasoningNotifications = useSelector(
        state => state.notifications.agentReasoning.data
    )

    // Only show reasoning for the current pending message (strict filtering)
    const matchingReasoning = agentReasoningNotifications?.filter(
        evt => (
            (pendingRequestMessageId && evt?.message_id === pendingRequestMessageId) ||
            (pendingRequestUniqueId && evt?.unique_id === pendingRequestUniqueId)
        )
    ) || []

    // If no reasoning steps, don't render
    if (matchingReasoning.length === 0) {
        return null
    }

    return (
        <div className='mt-2 ml-10 mb-2'>
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='flex items-center gap-2 text-sm text-[#5C53C0] hover:text-[#3E3696] transition-colors'
            >
                <Brain size={16} className='text-[#5C53C0]' />
                <span className='font-medium'>Thinking Process</span>
                <span className='text-xs text-gray-500'>({matchingReasoning.length} steps)</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Reasoning Steps */}
            {isExpanded && (
                <div className='mt-2 pl-2 border-l-2 border-[#EAE8FF] space-y-2'>
                    {matchingReasoning.map((reasoning, index) => (
                        <div
                            key={reasoning.id || index}
                            className='flex items-start gap-2 animate-fadeIn'
                        >
                            <div className='mt-1'>
                                {index === matchingReasoning.length - 1 ? (
                                    <Sparkles size={12} className='text-[#5C53C0] animate-pulse' />
                                ) : (
                                    <Lightbulb size={12} className='text-[#717196]' />
                                )}
                            </div>
                            <div className='flex-1'>
                                <p className='text-xs text-gray-600 leading-relaxed'>
                                    {reasoning.message || reasoning.content || reasoning.reasoning || JSON.stringify(reasoning.data)}
                                </p>
                                {/* {reasoning.agent_name && (
                                    <span className='text-[10px] text-[#5C53C0] font-medium'>
                                        — {reasoning.agent_name}
                                    </span>
                                )} */}
                            </div>
                        </div>
                    ))}

                    {/* Current thinking indicator */}
                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                        <div className='flex space-x-1'>
                            <div className='w-1 h-1 bg-[#5C53C0] rounded-full animate-bounce'></div>
                            <div className='w-1 h-1 bg-[#5C53C0] rounded-full animate-bounce' style={{ animationDelay: '0.15s' }}></div>
                            <div className='w-1 h-1 bg-[#5C53C0] rounded-full animate-bounce' style={{ animationDelay: '0.3s' }}></div>
                        </div>
                        <span>thinking...</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ThinkingIndicator
