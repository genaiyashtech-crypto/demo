import React, { useState } from 'react';
import * as Icons from 'lucide-react'; 
import { Tooltip } from 'antd';

const MAX_VISIBLE = 8;

function AgentSelector({ 
  sender, 
  suggestedAgents, 
  currentActiveAgent, 
  agentClickHandler, 
  extractMainFunction
}) {
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [shaking, setShaking] = useState({});

  if (
    sender !== 'bot' ||
    !Array.isArray(suggestedAgents) ||
  
    return null;
  }

  const agentsToDisplay = showAllAgents
    ? suggestedAgents
    : suggestedAgents.slice(0, MAX_VISIBLE);

  const triggerShake = (agentId) => {
    setShaking(prev => ({ ...prev, [agentId]: true }));
    setTimeout(() => {
      setShaking(prev => ({ ...prev, [agentId]: false }));
    }, 500);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 pb-2">
        {agentsToDisplay.map(agent => {
          const Icon =
            (agent.agent_logo && Icons[agent.agent_logo]) || Icons.Bot;
          const isActive = agent.agent_id === currentActiveAgent?.agent_id;
          const is_favorite = agent?.is_favorite;
          const is_assigned = agent?.is_assigned;
          const mainFunction = extractMainFunction(agent);

          return (
            <Tooltip
              key={agent.agent_id}
              title={
                is_assigned
                  ? 'Click to start conversation'
                  : "You don't have access to this agent. Please contact Team Owner."
              }
            >
              <button
                key={agent.agent_id}
                type='button'
                tabIndex={is_assigned ? 0 : -1}
                onClick={e => {
                  if (is_assigned) {
                    agentClickHandler(agent);
                  } else {
                    e.preventDefault();
                    triggerShake(agent.agent_id);
                  }
                }}
                className={`
                  relative mt-1 p-0.5 rounded-2xl transition
                  flex items-center justify-center text-left group
                  w-[192px] min-w-[192px] h-[100px] overflow-hidden border
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400'
                    : 'bg-gray-200 hover:shadow-md hover:-translate-y-0.5'
                  }
                  ${shaking[agent.agent_id] ? 'shake-card' : ''}
                  ${is_assigned ? '' : 'not-assigned-card'}
                `}
                aria-pressed={isActive}
                aria-label={`Open ${agent.agent_name}`}
                role='listitem'
                style={{
                  padding: 0,
                  cursor: is_assigned ? 'pointer' : 'not-allowed'
                }}
              >
                {isActive && (
                  <div className='absolute inset-2 rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 blur-lg opacity-30 -z-10' />
                )}
                <div
                  className={`
                    bg-white rounded-xl p-2.5 h-full w-full 
                    flex flex-col relative overflow-hidden
                    ${isActive ? 'ring-1 ring-indigo-300' : ''}
                  `}
                  style={{ minWidth: 0, minHeight: 0 }}
                >
                  <div className='flex-1 flex flex-col min-w-0'>
                    <div className='flex items-start justify-between mb-1 min-w-0'>
                      <div className='flex flex-wrap gap-1 max-w-[70%] min-w-0'>
                        {mainFunction && (
                          <span
                            className='px-2 py-0.5 text-[8px] font-medium text-[#717196] bg-[#EAE8FF] rounded-lg leading-tight max-w-[90px] truncate'
                            title={mainFunction}
                          >
                            {mainFunction}
                          </span>
                        )}
                      </div>
                      <span className='flex-shrink-0 flex items-center'>
                        <button
                          type='button'
                          aria-label={is_favorite ? "Unfavorite agent" : "Favorite agent"}
                          className="bg-none border-none p-0 m-0 cursor-pointer"
                          tabIndex={-1}
                        >
                          {is_assigned ? (
                            is_favorite ? (
                              <Icons.Heart
                                fill="red"
                                color="red"
                                size={16}
                                className="text-gray-500 shrink-0 animate-pulse"
                              />
                            ) : (
                              <Icons.Heart
                                size={16}
                                className="text-gray-500 shrink-0"
                              />
                            )
                          ) : (
                            <Icons.Lock
                              size={16}
                              className="text-gray-500 shrink-0"
                            />
                          )}
                        </button>
                      </span>
                    </div>
                    <div className='flex items-center gap-1  min-w-0'>
                      <span className='flex items-center gap-1.5 min-w-0'>
                        <Icon className='w-5 h-5 text-[#5C53C0] flex-shrink-0' />
                        <div
                          className='text-sm font-medium text-[#3E3696] leading-none max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer min-w-0 align-middle'
                          title={agent.agent_name}
                          style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            minWidth: 0,
                          }}
                        >
                          {agent.agent_name}
                        </div>
                      </span>
                    </div>
                    <div
                      className='text-[11px] text-[#57557A] line-clamp-2 break-words max-w-full mt-1 overflow-hidden'
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={
                        agent.tagline || agent.agent_description || 'No Description'
                      }
                    >
                      {agent.tagline || agent.agent_description || 'No Description'}
                    </div>
                  </div>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>
      {suggestedAgents.length > MAX_VISIBLE && (
        <div className="flex justify-end  w-full">
          <button
            onClick={() => setShowAllAgents(a => !a)}
            className="mt-2 px-2 py-0 bg-transparent border-none text-[#3E3696] mr-48 font-medium text-xs leading-8 tracking-[0.01em] font-sans hover:underline transition"
            style={{ outline: 'none' }}
          >
            {showAllAgents ? (
              <>
                Show Less <span aria-hidden>▲</span>
              </>
            ) : (
              <>
                Show More ({suggestedAgents.length - MAX_VISIBLE}) <span aria-hidden>▼</span>
              </>
            )}
          </button>
        </div>
      )}
      <style>
        {`
        .shake-card {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        `}
      </style>
    </div>
  );
}

export default AgentSelector;
