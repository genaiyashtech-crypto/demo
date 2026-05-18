import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * FollowUpQuestions Component
 * Displays follow-up question suggestions as clickable chips below bot messages
 * 
 * @param {string} sender - The message sender ('user' or 'bot')
 * @param {string[]} followUpQuestions - Array of follow-up question strings
 * @param {function} onQuestionClick - Handler when a question chip is clicked
 */
function FollowUpQuestions({
    sender,
    followUpQuestions,
    onQuestionClick
}) {
    // Only show for bot messages with follow-up questions
    if (
        sender !== 'bot' ||
        !Array.isArray(followUpQuestions) ||
        followUpQuestions.length === 0
    ) {
        return null;
    }

    const handleChipClick = (question) => {
        if (onQuestionClick && typeof onQuestionClick === 'function') {
            onQuestionClick(question);
        }
    };

    return (
        <div className="follow-up-questions-container w-full mt-2">
            <div className="flex flex-wrap gap-2">
                {followUpQuestions.map((question, index) => (
                    <button
                        key={`follow-up-${index}`}
                        type="button"
                        onClick={() => handleChipClick(question)}
                        className="
              follow-up-chip
              inline-flex items-center gap-1.5
              px-3 py-1.5
              text-xs font-medium
              text-[#3E3696] 
              bg-[#F5F4FF]
              border border-[#E0DEFF]
              rounded-full
              cursor-pointer
              transition-all duration-200 ease-in-out
              hover:bg-[#EAE8FF]
              hover:border-[#C5C1FF]
              hover:shadow-sm
              hover:-translate-y-0.5
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-[#5C53C0]
              focus:ring-opacity-50
              max-w-full
            "
                        title={question}
                    >
                        <MessageCircle
                            size={12}
                            className="flex-shrink-0 text-[#5C53C0]"
                        />
                        <span className="truncate max-w-[250px]">
                            {question}
                        </span>
                    </button>
                ))}
            </div>

            <style>
                {`
        .follow-up-questions-container {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .follow-up-chip {
          animation: chipAppear 0.2s ease-out backwards;
        }
        
        .follow-up-chip:nth-child(1) { animation-delay: 0.05s; }
        .follow-up-chip:nth-child(2) { animation-delay: 0.1s; }
        .follow-up-chip:nth-child(3) { animation-delay: 0.15s; }
        .follow-up-chip:nth-child(4) { animation-delay: 0.2s; }
        .follow-up-chip:nth-child(5) { animation-delay: 0.25s; }
        
        @keyframes chipAppear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        `}
            </style>
        </div>
    );
}

export default FollowUpQuestions;
