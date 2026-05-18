import React from 'react'
import InputComponent from './InputComponent'
import * as Icons from 'lucide-react'
import nia_bot_logo from '../../../assets/nia_bot_logo.png'
import { QuickTopics } from './QuickTopics'
import {
  setCurrentActiveAgent,
  setMessageToEmptyForChat,
  setNewConversations
} from '../../../redux/features/chat/chatSlice'
import { useDispatch, useSelector } from 'react-redux'
import CurrentAgentIndicator from './utils/CurrentAgentIndicator'
import { invokeServerBackend } from '../../../redux/features/chat/chatActions'
import { use } from 'react'
import { message } from 'antd'
import WorkspaceHomeComponent from '../../workspace/WorkspaceLandingComponent'
import WorkspaceLandingComponent from '../../workspace/WorkspaceLandingComponent'


// Default prompts for General Chat when no agent is selected
const generalChatPrompts = [
  "How can NIA help me?",
  "How can NIA help me to reduce my coding efforts?",
  "I need to perform analysis of my RFP. Suggest me relevant agent.",
  "Suggest me any agent for application modernization",
  "Which agent can help me to summarize a video?",
  "Which agent can help me to know more about Travel policies in YASH?"
]

const HomeComponent = ({
  input,
  loading,
  uploadedFiles,
  uploadingFiles,
  onInputChange,
  handleSendMessage,
  handleUploadFile,
  onTextAreaEnhance,
  handleRemoveFile,
  handleRemoveUploadingFile,
  onSparkle,
  promptEnhancerLoading,
  handleSpeechToggle,
  speechToText,
  allAgentCards,
  allAgentCardsLoading,

  setInput,
  onFilesDrop
}) => {
  const dispatch = useDispatch()
  const { currentActiveAgent, currentActiveTabforSwitch } = useSelector(
    state => state.chat
  )
  const { currentActiveWorkspace } = useSelector(state => state.workspace);

  return (
    <>





      <div className='flex flex-col h-full overflow-hidden'>
        {/* Content area - takes remaining space */}
        <div className='flex-1 overflow-hidden'>
          <QuickTopics
            show={allAgentCardsLoading}
            onTopicClick={t => {
              console.log('tt', t?.agent_name)
              console.log('tt', currentActiveAgent?.agent_name)
              if (currentActiveAgent?.agent_name == t?.agent_name) {
                // dispatch(setCurrentActiveAgent(t));
                // setInput(`${t?.agent_constraints || ""}`);
                dispatch(setNewConversations(false))
                dispatch(setMessageToEmptyForChat(false))
                //server invoke

                dispatch(
                  invokeServerBackend({
                    agentBackendHostname: t?.agentBackendHostname,
                    agentHostname: t?.agentHostname,
                    agentType: t?.agentType
                  })
                )
                return
              } else {
                dispatch(setNewConversations(false))
                dispatch(setMessageToEmptyForChat(false))
                dispatch(setCurrentActiveAgent(t))
                // setInput(`${t?.agent_constraints || ""}`);

                //server invoke
                dispatch(
                  invokeServerBackend({
                    agentBackendHostname: t?.agentBackendHostname,
                    agentHostname: t?.agentHostname,
                    agentType: t?.agentType
                  })
                )
              }
            }}
            topics={allAgentCards}
          />
        </div>

        {/* Input area - fixed at bottom */}
        <div className='flex-shrink-0 w-full px-4 sm:px-8 md:px-12 flex flex-col items-center'>
          <div className='w-full max-w-[1200px]'>
            {/* Suggested Prompts */}
            <div className='mt-2 mb-2'>
              {/* Only show the header and prompts if there are prompts to display */}
              {(currentActiveAgent?.agent_constraints?.prompt_template?.length > 0 ||
                generalChatPrompts.length > 0) && (
                  <>
                    <p className="text-xs text-[#26215B] font-semibold mb-1.5">General Prompts:</p>

                    <div className='flex flex-wrap gap-2 justify-center'>
                      {(currentActiveAgent?.agent_constraints?.prompt_template
                        ?.length > 0
                        ? currentActiveAgent.agent_constraints.prompt_template
                        : generalChatPrompts
                      )
                        .slice(0, 5)
                        .map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Format prompt with variable placeholders like agent click does
                              const promptVariables =
                                currentActiveAgent?.agent_constraints
                                  ?.prompt_template_variable_name
                              let formattedPrompt = prompt
                              if (promptVariables?.length) {
                                promptVariables.forEach(v => {
                                  formattedPrompt = formattedPrompt.replace(
                                    `{{${v}}}`,
                                    `.__${v}__.`
                                  )
                                })
                              }
                              setInput(formattedPrompt)
                            }}
                            className="px-2.5 py-1 text-xs text-[#3E3696] bg-white border border-[#DEE4EE] rounded-2xl hover:bg-[#EAE8FF] hover:border-[#5C53C0] transition-all duration-200"
                          >
                            {prompt}
                          </button>
                        ))}
                    </div>
                  </>
                )}
            </div>
            <InputComponent
              input={input}
              loading={loading}
              uploadedFiles={uploadedFiles}
              uploadingFiles={uploadingFiles}
              onInputChange={onInputChange}
              onKeyPress={e =>
                e.key === 'Enter' && !e.shiftKey && handleSendMessage()
              }
              onTextAreaEnhance={onTextAreaEnhance}
              onSendMessage={handleSendMessage}
              onUploadFile={handleUploadFile}
              onFilesDrop={onFilesDrop}
              onRemoveFile={handleRemoveFile}
              onRemoveUploadingFile={handleRemoveUploadingFile}
              isHomeState={true}
              onSparkle={onSparkle}
              setInput={setInput}
              onSparkleLoading={promptEnhancerLoading}
              onSpeechToggle={handleSpeechToggle}
              speechToText={speechToText}
            />



            {/* Footer */}
            <div className='text-center my-2 '>
              <div className='text-[10px] text-[#717196]'>
                Copyright © {new Date().getFullYear()}. YASH Technologies. All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default HomeComponent
