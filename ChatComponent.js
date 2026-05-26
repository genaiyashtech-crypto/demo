import React, { useCallback, useEffect, useRef } from 'react'
import { FileOutlined } from '@ant-design/icons'
import {
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  Copy,
  Volume2,
  Square,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  FileIcon,
  Download,
  Send,
  X,
  MessageCircle,
  Brain,
  Sparkles
} from 'lucide-react'
import ActivityThread from '../../workspace/ActivityThread'
import * as Icons from 'lucide-react'
import NiaMascot from '../../../assets/NiaMascot.svg'
import nia_logo_animated from '../../../assets/nia_logo_animated.gif'
import nia_gif from '../../../assets/nia_gif.gif'
import InputComponent from './InputComponent'
import {
  Avatar,
  Button,
  Input as AntInput,
  Tooltip,
  Upload,
  message,
  Popover,
  Spin,
  Modal
} from 'antd'
import LoadingIndicator from './LoadingIndicator'
import { useDispatch, useSelector } from 'react-redux'
import SkeletonUtility, {
  TypingIndicator,
  ConversationLoader,
  NiaSkeleton
} from '../../../utils/skeleton/SkeletonUtility'
import { Input, Checkbox } from 'antd'
import { useState } from 'react'
import MarkdownRenderer from './utils/MarkdownRenderer'
import { getConverstionsBySessionId } from '../../../redux/features/chat/chatActions'
import { setCurrentActiveAgent, setCurrentActiveSession } from '../../../redux/features/chat/chatSlice'
import CurrentAgentIndicator from './utils/CurrentAgentIndicator'
import { URL } from '../../../utils/constants'
import Workspace from '../../workspace/Workpace'
import AgentSelector from './AgentSelector'
import FollowUpQuestions from './FollowUpQuestions'
import ThinkingIndicator from './ThinkingIndicator'

// Live Counter Component - shows elapsed time while waiting for response
const LiveCounter = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return

    // Update every 100ms for smooth counting
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime])

  // Format elapsed time
  const formatElapsed = (ms) => {
    if (ms < 1000) return `${(ms / 1000).toFixed(1)}s`
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}.${Math.floor((ms % 1000) / 100)}s`
  }

  return (
    <span className='inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100'>
      <span className='relative flex h-2 w-2'>
        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
        <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
      </span>
      <span className='text-xs font-medium text-blue-600'>
        {formatElapsed(elapsed)}
      </span>
    </span>
  )
}

// Default prompts for General Chat when no agent is selected
const generalChatPrompts = [
  'How can NIA help me?',
  'How can NIA help me to reduce my coding efforts?',
  'I need to perform analysis of my RFP. Suggest me relevant agent.',
  'Suggest me any agent for application modernization',
  'Which agent can help me to summarize a video?',
  'Which agent can help me to know more about Travel policies in YASH?'
]

const { TextArea } = Input

const getPresignedUrl = async key => {
  // Input validation
  if (!key || typeof key !== 'string') {
    console.warn('Invalid key provided to getPresignedUrl:', key)
    return null
  }

  try {
    const accessToken = localStorage.getItem('accessToken')

    const response = await fetch(`${URL}/generate-s3-presigned-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'keycloak-token': localStorage.getItem('keycloakToken'),

        Authorization: `Bearer ${accessToken}` // attach token here
      },
      body: JSON.stringify({
        action: 'view',
        documents: [{ key }]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch presigned URL`)
    }

    const data = await response.json()
    const url = data?.data?.documents?.[0]?.url

    if (!url) {
      console.warn('No URL found in response:', data)
      return null
    }

    return url
  } catch (error) {
    console.error('Presigned URL error:', error)
    return null
  }
}

// Safe file size formatter
const formatFileSize = size => {
  try {
    if (!size || isNaN(size) || size <= 0) return ''
    const kb = size / 1024
    return `${kb.toFixed(1)} KB`
  } catch (error) {
    console.warn('Error formatting file size:', error)
    return ''
  }
}

// Safe timestamp formatter fallback
const safeFormatTimestamp = (timestamp, formatTimestamp) => {
  try {
    if (formatTimestamp && typeof formatTimestamp === 'function') {
      return formatTimestamp(timestamp)
    }
    // Fallback timestamp formatting
    if (timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    }
    return ''
  } catch (error) {
    console.warn('Error formatting timestamp:', error)
    return ''
  }
}

// Safe copy to clipboard with fallback
const safeCopyToClipboard = async (text, copyToClipboard) => {
  try {
nt.createElement('textarea')
     
      document.body.removeChild(textArea)
      message.success('Copied to clipboard')
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    message.error('Failed to copy to clipboard')
  }
}

// Component for direct HTML preview without collapse
const HtmlPreviewDirect = ({
  fileUrl,
  fileName,
  htmlPresignedUrls,
  setHtmlPresignedUrls,
  htmlPreviewLoading,
  setHtmlPreviewLoading,
  getPresignedUrl
}) => {
  const fetchAttemptedRef = useRef(false)

  // Auto-fetch presigned URL on mount
  useEffect(() => {
    // Only fetch once per fileUrl
    if (!fileUrl || fetchAttemptedRef.current) {
      return
    }

    const fetchContent = async () => {
      // Mark as attempted immediately to prevent re-entry
      fetchAttemptedRef.current = true

      console.log('Auto-generating presigned URL for HTML file:', fileUrl)
      setHtmlPreviewLoading(prev => ({ ...prev, [fileUrl]: true }))

      try {
        const url = await getPresignedUrl(fileUrl)
        console.log('Presigned URL generated:', url)
        if (url) {
          setHtmlPresignedUrls(prev => ({ ...prev, [fileUrl]: url }))
          // Note: We deliberately do NOT set loading to false here.
          // We wait for the iframe onLoad event to dismiss the loader.
        } else {
          setHtmlPreviewLoading(prev => ({ ...prev, [fileUrl]: false }))
        }

      } catch (error) {
        console.error('Error generating presigned URL:', error)
        setHtmlPreviewLoading(prev => ({ ...prev, [fileUrl]: false }))
      }
    }

    fetchContent()
  }, [fileUrl, setHtmlPresignedUrls, setHtmlPreviewLoading, getPresignedUrl])

  const isLoading = htmlPreviewLoading[fileUrl]
  const hasUrl = !!htmlPresignedUrls[fileUrl]

  // Resizing logic
  const [height, setHeight] = useState(600)
  const [isResizing, setIsResizing] = useState(false)
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  const handleMouseDown = useCallback((e) => {
    isDraggingRef.current = true
    setIsResizing(true)
    startYRef.current = e.clientY
    startHeightRef.current = height
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
  }, [height])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const deltaY = e.clientY - startYRef.current
    const newHeight = Math.min(Math.max(startHeightRef.current + deltaY, 200), 2000)
    setHeight(newHeight)
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div className='mt-2 w-full relative' style={{ minHeight: isLoading && !hasUrl ? '60px' : 'auto' }}>
      {/* Invisible overlay to capture mouse events during resize if needed */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-ns-resize" />}

      {isLoading && (
        <div
          className={`bg-[#F9F8FF] border border-[#EBE5F7] rounded-lg w-full flex flex-col items-center justify-center transition-opacity duration-500 overflow-hidden ${hasUrl ? 'absolute inset-0 z-20 h-full' : ''
            }`}
          style={{ height: hasUrl ? '100%' : `${height}px` }}
        >
          <div className="w-full h-full relative">
            {/* Skeleton Shimmer Background - Moving Diagonal Stripes */}
            <div
              className="absolute inset-0 opacity-40 animate-[slide-background_2s_linear_infinite]"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #F9F8FF, #F9F8FF 10px, #EBE5F7 10px, #EBE5F7 20px)',
                backgroundSize: '200% 200%'
              }}
            ></div>
            <style jsx>{`
              @keyframes slide-background {
                0% { background-position: 0% 0%; }
                100% { background-position: 50% 50%; }
              }
            `}</style>
            {/* Centered Loading Content */}
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-6 text-[#3E3696]">
              {/* Icon with Spinner */}
              <div className="relative">
                <div className="relative z-10 p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-sm ring-1 ring-[#EBE5F7]">
                  <FileIcon size={32} className="text-[#3E3696]" />
                </div>
                {/* Spinning Ring */}
                <div className="absolute -inset-1 border-2 border-[#3E3696]/10 border-t-[#3E3696] rounded-full animate-spin"></div>
              </div>

              {/* Simple Loading Text */}
              <span className="text-sm font-medium animate-pulse text-[#3E3696]/80">Loading preview...</span>
            </div>
          </div>
        </div>
      )}

      {hasUrl ? (
        <div
          className={`relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform ${isLoading ? 'opacity-0 translate-y-12 blur-sm scale-95' : 'opacity-100 translate-y-0 blur-0 scale-100'
            }`}
          style={{ height: `${height}px` }}
        >
          <iframe
            src={htmlPresignedUrls[fileUrl]}
            title={fileName}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#ffffff',
              pointerEvents: isResizing ? 'none' : 'auto'
            }}
            sandbox='allow-scripts allow-same-origin'
            scrolling='no'
            onLoad={() => {
              console.log('HTML Preview loaded')
              setTimeout(() => {
                setHtmlPreviewLoading(prev => ({ ...prev, [fileUrl]: false }))
              }, 400) // Small delay to let the 100% progress be seen
            }}
          />

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center bg-transparent group hover:bg-gray-50/50 transition-colors z-30"
            onMouseDown={handleMouseDown}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors"></div>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg w-full animate-fadeIn'>
            <span className='text-sm text-red-600'>Failed to load HTML preview</span>
          </div>
        )
      )}
    </div>
  )
}

// Component to display LLM reasoning/thoughts above bot message
const ReasoningSection = ({ reasonings = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!reasonings || reasonings.length === 0) return null

  return (
    <div className="mb-2 w-full max-w-[100%]">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 group w-full"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <Sparkles size={14} className="text-purple-500" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-medium text-purple-700">
            Thinking Process
          </span>
          <span className="text-[10px] text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">
            {reasonings.length} step{reasonings.length > 1 ? 's' : ''}
          </span>
        </div>
        <ChevronRight
          size={14}
          className={`text-purple-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-200 ml-2">
          {reasonings.map((reasoning, idx) => (
            <div
              key={reasoning.id || idx}
              className="bg-gradient-to-r from-purple-50/50 to-transparent p-2.5 rounded-r-lg"
            >
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-semibold text-purple-600">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {/* <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                      {reasoning.server_name?.replace(/_/g, ' ') || 'NIA'}
                    </span>
                  </div> */}
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {reasoning.reasoning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ChatComponent = ({
  messages = [],
  loading = false,
  pendingRequestMessageId = null,
  pendingRequestUniqueId = null,
  sessionId = null,
  error = null,
  errorDetail = null,
  sessionTitle = 'Chat Session',
  chatContainerRef,
  handleScroll,
  messagesEndRef,
  showUpArrow = false,
  showDownArrow = false,
  scrollToTop,
  scrollToBottomInstant,
  speech = { isSupported: false, isSpeaking: false, currentSpeakingId: null },
  copyToClipboard,
  formatTimestamp,
  input = '',
  setInput,
  uploadedFiles = [],
  uploadingFiles = [],
  onInputChange,
  handleSendMessage,
  handleUploadFile,
  handleRemoveFile,
  handleRemoveUploadingFile,
  onSparkle,
  promptEnhancerLoading = false,
  handleSpeechToggle,

  speechToText = { isListening: false },
  onFilesDrop
}) => {
  // This function will find URLs and wrap them in Markdown `[url](url)` format:
  const dispatch = useDispatch()
  const {
    currentActiveSession,
    newConversations,
    currentActiveAgent,
    currentActiveTabforSwitch
  } = useSelector(state => state.chat)
  const { currentActiveWorkspace } = useSelector(state => state.workspace)

  // Track which message is showing feedback form
  const [feedbackState, setFeedbackState] = useState({})

  // Keep local votes in state
  const [localVotes, setLocalVotes] = useState({})

  // State for HTML file presigned URLs (keyed by file_url)
  const [htmlPresignedUrls, setHtmlPresignedUrls] = useState({})
  const [htmlPreviewLoading, setHtmlPreviewLoading] = useState({})

  // State for live counter - tracks when user sent message
  const [requestStartTime, setRequestStartTime] = useState(null)

  // Set start time when loading starts (user sent a message)
  useEffect(() => {
    if (loading) {
      setRequestStartTime(Date.now())
    } else {
      setRequestStartTime(null)
    }
  }, [loading])

  // Pre-defined feedback options
  const feedbackOptions = [
    'Not factually correct',
    "Didn't follow instructions",
    'Offensive/Unsafe',
    'Wrong language',
    'Poorly formatted',
    'Generic/Bland'
  ]

  const getConverstionsBySessionIdLoading = useSelector(state => state.chat)

  const handleFileClick = useCallback(async file => {
    try {
      console.log('Clicked on file:', file)

      if (!file) {
        message.error('Invalid file')
        return
      }

      // Handle different file URL formats
      let key
      if (typeof file === 'string') {
        // Extract key from S3 URL
        const s3Match = file.match(/s3\.amazonaws\.com\/(.+)/)
        if (s3Match) {
          key = s3Match[1]
        } else {
          // If it's already a direct URL, try to open it
          window.open(file, '_blank')
          return
        }
      } else if (file.key) {
        key = file.key
      } else if (file.url) {
        const s3Match = file.url.match(/s3\.amazonaws\.com\/(.+)/)
        key = s3Match ? s3Match[1] : null
      }

      if (!key) {
        message.error('Unable to extract file key')
        return
      }

      const url = await getPresignedUrl(key)
      if (url) {
        window.open(url, '_blank')
      } else {
        message.error('Unable to open file')
      }
    } catch (error) {
      console.error('Error handling file click:', error)
      message.error('Error opening file')
    }
  }, [])

  // Handle file download with presigned URL
  const handleFileDownload = useCallback(async file => {
    try {
      console.log('Clicked on file:', file)

      const url = await getPresignedUrlForDownload(file?.file_url)
      if (url) {
        window.open(url, '_blank')
      } else {
        message.error('Unable to open file')
      }
    } catch (error) {
      console.error('Error handling file click:', error)
      message.error('Error opening file')
    }
  }, [])

  // Generate presigned URL for download when appear in response
  const getPresignedUrlForDownload = async key => {
    // Input validation
    if (!key || typeof key !== 'string') {
      console.warn('Invalid key provided to getPresignedUrl:', key)
      return null
    }

    try {
      const accessToken = localStorage.getItem('accessToken')

      const response = await fetch(`${URL}/generate-s3-presigned-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'keycloak-token': localStorage.getItem('keycloakToken'),

          Authorization: `Bearer ${accessToken}` // attach token here
        },
        body: JSON.stringify({
          action: 'download',
          documents: [{ key }]
        })
      })

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch presigned URL`
        )
      }

      const data = await response.json()
      const url = data?.data?.documents?.[0]?.url

      if (!url) {
        console.warn('No URL found in response:', data)
        return null
      }

      return url
    } catch (error) {
      console.error('Presigned URL error:', error)
      return null
    }
  }

  // Safe scroll handlers with fallbacks
  const safeScrollToTop = useCallback(() => {
    try {
      if (scrollToTop && typeof scrollToTop === 'function') {
        scrollToTop()
      } else if (chatContainerRef?.current) {
        chatContainerRef.current.scrollTop = 0
      }
    } catch (error) {
      console.error('Error scrolling to top:', error)
    }
  }, [scrollToTop, chatContainerRef])

  const safeScrollToBottom = useCallback(() => {
    try {
      if (
        scrollToBottomInstant &&
        typeof scrollToBottomInstant === 'function'
      ) {
        scrollToBottomInstant()
      } else if (messagesEndRef?.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error)
    }
  }, [scrollToBottomInstant, messagesEndRef])

  // Safe speech handlers
  const safeSpeechToggle = useCallback(
    (text, id) => {
      try {
        if (speech?.toggle && typeof speech.toggle === 'function') {
          speech.toggle(text, id)
        } else if ('speechSynthesis' in window) {
          // Fallback speech synthesis
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
          } else {
            const utterance = new SpeechSynthesisUtterance(text)
            window.speechSynthesis.speak(utterance)
          }
        }
      } catch (error) {
        console.error('Error with speech toggle:', error)
        message.error('Speech synthesis error')
      }
    },
    [speech]
  )

  const safeSpeechStop = useCallback(() => {
    try {
      if (speech?.stop && typeof speech.stop === 'function') {
        speech.stop()
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } catch (error) {
      console.error('Error stopping speech:', error)
    }
  }, [speech])

  // Safe event handlers
  const safeHandleSendMessage = useCallback(() => {
    try {
      if (handleSendMessage && typeof handleSendMessage === 'function') {
        handleSendMessage()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      message.error('Failed to send message')
    }
  }, [handleSendMessage])

  useEffect(() => safeSpeechStop(), [currentActiveSession?.session_id])

  const handleVote = async (
    messageId,
    vote,
    feedback = '',
    selectedOptions = []
  ) => {
    console.log(messageId)
    // ✅ Update locally first
    setLocalVotes(prev => ({ ...prev, [messageId]: vote }))

    try {
      // Combine selected options and custom feedback
      const finalFeedback = [
        ...selectedOptions,
        ...(feedback.trim() ? [feedback.trim()] : [])
      ].join(', ')
      const accessToken = localStorage.getItem('accessToken')

      const response = await fetch(`${URL}/messages/${messageId}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`, // attach token here
          'keycloak-token': localStorage.getItem('keycloakToken')
        },
        body: JSON.stringify({
          vote,
          feedback: finalFeedback,
          updated_by: 'user'
        })
      })

      if (!response.ok) throw new Error('Failed to send feedback')
      message.success(
        'Thank you! Your feedback helps make NIA better for everyone'
      )
    } catch (error) {
      console.error(error)
      message.error('Error submitting feedback')
      // (optional) rollback local vote if error
      // setLocalVotes((prev) => ({...prev, [messageId]: null }));
    }
  }

  const handleThumbsDown = messageId => {
    // Set the vote locally immediately
    setLocalVotes(prev => ({ ...prev, [messageId]: 'down' }))
    // Show feedback form for this message
    setFeedbackState(prev => ({
      ...prev,
      [messageId]: {
        showForm: true,
        feedback: '',
        selectedOptions: []
      }
    }))
  }

  const handleFeedbackSubmit = async messageId => {
    const feedback = feedbackState[messageId]?.feedback || ''
    const selectedOptions = feedbackState[messageId]?.selectedOptions || []

    if (!feedback.trim() && selectedOptions.length === 0) {
      message.warning(
        'Please select at least one option or provide custom feedback'
      )
      return
    }

    handleVote(messageId, 'down', feedback, selectedOptions)

    // Hide the feedback form and clear state
    setFeedbackState(prev => {
      const updated = { ...prev }
      delete updated[messageId]
      return updated
    })
  }

  const handleFeedbackCancel = messageId => {
    // Remove the vote if user cancels
    setLocalVotes(prev => {
      const updated = { ...prev }
      delete updated[messageId]
      return updated
    })

    // Hide the feedback form and clear state
    setFeedbackState(prev => {
      const updated = { ...prev }
      delete updated[messageId]
      return updated
    })
  }

  const updateFeedbackText = (messageId, text) => {
    setFeedbackState(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        feedback: text
      }
    }))
  }

  const handleOptionChange = (messageId, option, checked) => {
    setFeedbackState(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        selectedOptions: checked
          ? [...(prev[messageId]?.selectedOptions || []), option]
          : (prev[messageId]?.selectedOptions || []).filter(
            opt => opt !== option
          )
      }
    }))
  }

  const safeHandleInputChange = useCallback(
    value => {
      try {
        if (onInputChange && typeof onInputChange === 'function') {
          onInputChange(value)
        }
      } catch (error) {
        console.error('Error handling input change:', error)
      }
    },
    [onInputChange]
  )


  function extractMainFunction(agent) {
    for (const industry of agent.industries || []) {
      for (const department of industry.departments || []) {
        for (const func of department.functions || []) {
          if (func.function_name) return func.function_name;
        }
      }
    }
    return null;
  }
  const agentClickHandler = agent => {
    dispatch(setCurrentActiveSession(null))
    dispatch(setCurrentActiveAgent(agent))
  }

  return (
    <>
      <>
        {/* Gradient Line at Top - full width */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 z-10'></div>

        <div className='chatbot-input-wrapper relative '>
          <CurrentAgentIndicator />

          <div className='flex flex-row input-component-container'>
            {/* Main Chat Area - shrinks when panel is open */}
            <div
              className={`flex flex-col transition-all duration-300 ease-in-out 
                  w-full`}
            >
              {/* Messages Container  and  Message Loading Container */}

              {!getConverstionsBySessionIdLoading?.getConverstionsBySessionIdLoading ? (
                <div
                  ref={chatContainerRef}
                  className='flex-1 overflow-y-auto  scrollbar-hidden  p-3 px-3 space-y-2 min-h-0 chat-messages-container'
                  onScroll={handleScroll}
                >
                  {/* Centered Agent Display when no messages */}
                  {(!Array.isArray(messages) || messages.length === 0) && (
                    <div className='flex flex-col items-center justify-center h-full'>
                      {currentActiveAgent?.agent_name ? (
                        <>
                          {/* Agent Icon and Name in one row */}
                          <span className='flex items-center gap-2 mb-2'>
                            {(() => {
                              const AgentIcon =
                                currentActiveAgent?.agent_logo &&
                                  Icons[currentActiveAgent.agent_logo]
                                  ? Icons[currentActiveAgent.agent_logo]
                                  : Icons.Bot
                              return (
                                <AgentIcon
                                  size={24}
                                  className='text-[#3E3696]'
                                />
                              )
                            })()}
                            <span className='text-[#3E3696] font-semibold text-base'>
                              {currentActiveAgent?.agent_name}
                            </span>
                          </span>
                          {/* Agent Greeting */}
                          <span className='text-[#26215B] text-xl mt-1'>
                            {currentActiveAgent?.example_prompt ||
                              `How can I help you today?`}
                          </span>
                        </>
                      ) : (
                        <>
                          {/* General Chat Icon and Name in one row */}
                          <span className='flex items-center gap-2 mb-2'>
                            <Icons.HelpingHand
                              size={24}
                              className='text-[#3E3696]'
                            />
                            <span className='text-[#3E3696] font-semibold text-base'>
                              NIA Helper Agent
                            </span>
                          </span>
                          <span className='text-[#717196] text-sm mt-1'>
                            How can I help you today?
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {Array.isArray(messages) &&
                    messages.map((msg, idx) => {
                      // Safe message data extraction
                      const messageId = msg?.id
                      const sender = msg?.sender || 'unknown'
                      const text = msg?.text || ''
                      const files = Array.isArray(msg?.files) ? msg.files : []
                      const timestamp = msg?.timestamp
                      const vote = msg?.vote
                      const effectiveVote = localVotes[messageId] ?? vote
                      const showFeedbackForm =
                        feedbackState[messageId]?.showForm || false
                      const feedbackText =
                        feedbackState[messageId]?.feedback || ''
                      const selectedOptions =
                        feedbackState[messageId]?.selectedOptions || []
                      const suggestedAgents = msg?.suggestedAgents || []
                      const followUpQuestions = msg?.followUpQuestions || []
                      const reasonings = msg?.reasonings || []

                      //if ongoing processing message, get response status
                      const responseStatus = msg?.response_status // <-- Add this line

                      // Calculate response time for bot messages
                      let responseTime = null
                      if (sender === 'bot' && idx > 0) {
                        // Find the last user message before this bot message
                        let prevUserMsgIdx = idx - 1
                        while (
                          prevUserMsgIdx >= 0 &&
                          messages[prevUserMsgIdx]?.sender !== 'user'
                        ) {
                          prevUserMsgIdx--
                        }
                        if (prevUserMsgIdx >= 0) {
                          const prevUserMsg = messages[prevUserMsgIdx]
                          const botTime = new Date(timestamp).getTime()
                          const userTime = new Date(
                            prevUserMsg.timestamp
                          ).getTime()
                          responseTime = botTime - userTime // in milliseconds
                        }
                      }

                      function formatFullTimestamp(ts) {
                        if (!ts) return ''
                        // Remove microseconds and timezone
                        const cleaned = ts.replace(/\.\d+(\+\d{2}:\d{2})?$/, '')
                        // Replace space with T for ISO format
                        const iso = cleaned.replace(' ', 'T') + 'Z' // Force as UTC
                        const date = new Date(iso)
                        // Convert to IST
                        const options = {
                          timeZone: 'Asia/Kolkata',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        }
                        // Format as 'YYYY-MM-DD HH:mm:ss'
                        const parts = new Intl.DateTimeFormat(
                          'en-GB',
                          options
                        ).formatToParts(date)
                        const obj = {}
                        parts.forEach(({ type, value }) => {
                          obj[type] = value
                        })
                        return `${obj.year}-${obj.month}-${obj.day} ${obj.hour}:${obj.minute}:${obj.second}`
                      }

                      const formatResponseTime = ms => {
                        if (!ms || ms < 0) return ''
                        const secs = ms / 1000
                        // Limit to max 8 decimal places, but remove trailing zeros
                        return `${secs.toFixed(8).replace(/\.?0+$/, '')} sec`
                      }

                      return (
                        <div
                          key={messageId}
                          className={`flex w-full ${sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          {/* Bot Avatar */}
                          {sender === 'bot' && (
                            <Tooltip
                              title="NIA"
                              placement="right"
                              mouseEnterDelay={0.3}
                              overlayClassName="nia-tooltip"
                            >
                              <img
                                src={NiaMascot}
                                alt="Bot"
                                className="w-8 h-8 rounded-full flex-shrink-0 mt-0 mr-2 cursor-pointer"
                                onError={e => {
                                  e.target.style.display = 'none'
                                  console.warn('Failed to load bot avatar')
                                }}
                              />
                            </Tooltip>
                          )}


                          <div
                            className={`flex flex-col space-y-1 max-w-[80%] ${sender === 'user' ? 'items-end' : 'items-start'
                              }`}
                          >
                            {/* LLM Reasoning/Thinking Process - Show above bot message */}
                            {sender === 'bot' && reasonings && reasonings.length > 0 && (
                              <ReasoningSection reasonings={reasonings} />
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`px-3 py-2 max-w-[100%] text-sm rounded-2xl break-normal whitespace-pre-wrap leading-relaxed  ${sender === 'bot'
                                ? 'bg-white text-gray-800  '
                                : 'bg-[#EAE8FF] text-[#26215B]  '
                                }`}
                            >
                              {sender === 'bot' ? (
                                text ? (
                                  <div className='prose prose-sm max-w-none'>
                                    <MarkdownRenderer text={text} />
                                  </div>
                                ) : (
                                  <span className='text-gray-600'>
                                    No content available
                                  </span>
                                )
                              ) : (
                                <span>{text || 'Empty message'}</span>
                              )}
                            </div>

                            {/* Suggested Agents Row (if any) */}
                            <AgentSelector
                              sender="bot"
                              suggestedAgents={suggestedAgents}
                              currentActiveAgent={currentActiveAgent}
                              agentClickHandler={agentClickHandler}
                              extractMainFunction={extractMainFunction}
                            />

                            {/* Follow-up Questions Chips */}
                            <FollowUpQuestions
                              sender="bot"
                              followUpQuestions={followUpQuestions}
                              onQuestionClick={(question) => {
                                if (setInput && typeof setInput === 'function') {
                                  setInput(question);
                                } else if (onInputChange && typeof onInputChange === 'function') {
                                  onInputChange(question);
                                }
                              }}
                            />


                            <div
                              className={`text-xs text-gray-400 px-1 ${sender === 'user' ? 'text-right' : 'text-left'
                                }`}
                            >
                              {/* Full date & time with microseconds */}
                              {/* {timestamp ? formatFullTimestamp(timestamp) : ''} */}

                              {/* Bot response time: show if available */}
                              {/* {sender === 'bot' && responseTime != null && (
                                <span className='ml-2 text-gray-500'>
                                  • Response time:{' '}
                                  {formatResponseTime(responseTime)}
                                </span>
                              )} */}
                            </div>

                            {/* User Files */}
                            {sender === 'user' && files.length > 0 && (
                              <div className='max-w-md'>
                                {files.length === 1 ? (
                                  <div
                                    className='flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors min-w-0'
                                    onClick={() =>
                                      handleFileClick(
                                        files[0]?.file_url || files[0]
                                      )
                                    }
                                  >
                                    {console.log('files', files[0])}
                                    <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 flex-shrink-0'>
                                      <FileIcon className='text-blue-700 w-3 h-3' />
                                    </div>
                                    <div className='flex flex-col min-w-0 flex-1'>
                                      <span
                                        className='text-gray-800 font-medium truncate text-xs'
                                        title={
                                          files[0]?.file_name ||
                                          files[0]?.filename
                                        }
                                      >
                                        {files[0]?.file_name ||
                                          files[0]?.filename}
                                      </span>
                                      <span className='text-gray-500 text-xs'>
                                        {formatFileSize(
                                          files[0]?.size || files[0]?.file_size
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className='grid gap-3'
                                    style={{
                                      gridTemplateColumns:
                                        files.length === 2
                                          ? 'repeat(2, 1fr)'
                                          : files.length === 3
                                            ? 'repeat(3, 1fr)'
                                            : 'repeat(auto-fit, minmax(140px, 1fr))'
                                    }}
                                  >
                                    {files.map((file, fileIdx) => (
                                      <div
                                        key={`${messageId}-file-${fileIdx}`}
                                        className='flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors min-w-0'
                                        onClick={() =>
                                          handleFileClick(
                                            file?.file_url || file
                                          )
                                        }
                                      >
                                        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 flex-shrink-0'>
                                          <FileIcon className='text-blue-700 w-3 h-3' />
                                        </div>
                                        <div className='flex flex-col min-w-0 flex-1'>
                                          <span
                                            className='text-gray-800 font-medium truncate text-xs'
                                            title={
                                              file?.file_name ||
                                              file?.filename ||
                                              'Unknown file'
                                            }
                                          >
                                            {file?.file_name ||
                                              file?.filename ||
                                              'Unknown file'}
                                          </span>
                                          <span className='text-gray-500 text-xs'>
                                            {formatFileSize(
                                              file?.size || file?.file_size
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* HTML File Preview - Auto-generate presigned URL and show in iframe directly */}

                            {sender === 'bot' && files?.length > 0 && (
                              <div className="flex flex-col gap-4 w-full">
                                {files
                                  .filter((f) =>
                                    f?.file_name?.toLowerCase().endsWith('.html')
                                  )
                                  .map((file, idx) => (
                                    <HtmlPreviewDirect
                                      key={`${messageId}-html-${idx}`}
                                      fileUrl={file?.file_url}
                                      fileName={file?.file_name}
                                      htmlPresignedUrls={htmlPresignedUrls}
                                      setHtmlPresignedUrls={
                                        setHtmlPresignedUrls
                                      }
                                      htmlPreviewLoading={htmlPreviewLoading}
                                      setHtmlPreviewLoading={
                                        setHtmlPreviewLoading
                                      }
                                      getPresignedUrl={getPresignedUrl}
                                    />
                                  ))}
                              </div>
                            )}

                            {/* Bot Files */}
                            {sender === 'bot' && files?.length > 0 && (
                              <div className='max-w-md'>
                                {files.length === 1 ? (
                                  <div className='flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm min-w-0'>
                                    {/* File icon */}
                                    <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 flex-shrink-0'>
                                      <FileIcon className='text-blue-700 w-3 h-3' />
                                    </div>

                                    {/* File details */}
                                    <div className='flex flex-col min-w-0 flex-1'>
                                      <span
                                        className='text-gray-800 font-medium truncate text-xs'
                                        title={
                                          files[0]?.file_name ||
                                          files[0]?.file_url
                                            ?.split('/')
                                            .pop()
                                            ?.split('?')[0] ||
                                          'file_1'
                                        }
                                      >
                                        {files[0]?.file_name ||
                                          files[0]?.file_url
                                            ?.split('/')
                                            .pop()
                                            ?.split('?')[0] ||
                                          'file_1'}
                                      </span>
                                      <span className='text-gray-500 text-xs'>
                                        {formatFileSize(files[0]?.file_size)}
                                      </span>
                                    </div>

                                    {/* Download button */}
                                    <button
                                      onClick={e =>
                                        handleFileDownload(files[0], e)
                                      }
                                      className='flex items-center justify-center w-6 h-6  rounded-full  hover:text-blue-700 hover:bg-blue-300 text-blue-700 transition'
                                      title='Download File'
                                    >
                                      <Download className='w-4 h-4' />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    className='grid gap-3'
                                    style={{
                                      gridTemplateColumns:
                                        files.length === 2
                                          ? 'repeat(2, 1fr)'
                                          : files.length === 3
                                            ? 'repeat(3, 1fr)'
                                            : 'repeat(auto-fit, minmax(140px, 1fr))'
                                    }}
                                  >
                                    {files.map((f, fileIdx) => {
                                      const fileName =
                                        f?.file_name ||
                                        f?.file_url
                                          ?.split('/')
                                          .pop()
                                          ?.split('?')[0]
                                      return (
                                        <div
                                          key={`${messageId}-file-${fileIdx}`}
                                          className='flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm min-w-0'
                                        >
                                          {/* File icon */}
                                          <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 flex-shrink-0'>
                                            <FileIcon className='text-blue-700 w-3 h-3' />
                                          </div>

                                          {/* File details */}
                                          <div className='flex flex-col min-w-0 flex-1'>
                                            <span
                                              className='text-gray-800 font-medium truncate text-xs'
                                              title={fileName}
                                            >
                                              {fileName}
                                            </span>
                                            <span className='text-gray-500 text-xs'>
                                              {formatFileSize(f?.file_size)}
                                            </span>
                                          </div>

                                          {/* Download button */}
                                          <button
                                            onClick={e =>
                                              handleFileDownload(f, e)
                                            }
                                            className='flex items-center justify-center w-6 h-6  rounded-full  hover:text-blue-700 hover:bg-blue-300 text-blue-700 transition'
                                            title='Download File'
                                          >
                                            <Download className='w-4 h-4' />
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}



                            <div className='flex flex-row'>
                              {/* Timestamp */}
                              <div
                                className={`text-[10px] text-[#717196]  ${sender === 'user' ? 'text-right' : 'text-left'
                                  }`}
                              >
                                {safeFormatTimestamp(timestamp, formatTimestamp)}
                              </div>
                              {/* Bot response time: show if available */}
                              {sender === 'bot' && responseTime != null && (
                                <span className='ml-2 text-[10px] text-[#717196]'>
                                  • Response time:{' '}
                                  {formatResponseTime(responseTime)}
                                </span>
                              )}
                            </div>

                            {/* Bot Action Buttons */}
                            {sender === 'bot' && text && (
                              <div className='flex items-center space-x-3 px-1'>
                                {/* Thumbs Up */}
                                <button
                                  className={`p-1 rounded-full transition-colors group hover:bg-gray-100 ${effectiveVote === 'up'
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                                    }`}
                                  onClick={() => {
                                    if (effectiveVote !== 'up')
                                      handleVote(messageId, 'up')
                                  }}
                                  disabled={effectiveVote === 'up'}
                                >
                                  <ThumbsUp
                                    className={`h-4 w-4 transform transition-all duration-200 
                                ${effectiveVote === 'up'
                                        ? 'text-blue-600 scale-110'
                                        : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                                      }`}
                                  />
                                </button>

                                {/* Thumbs Down */}
                                <button
                                  className={`p-1 rounded-full transition-colors group hover:bg-gray-100`}
                                  onClick={() => handleThumbsDown(messageId)}
                                >
                                  <ThumbsDown
                                    className={`h-4 w-4 transform transition-all duration-200
                                                        ${effectiveVote ===
                                        'down'
                                        ? 'text-red-600 scale-110'
                                        : 'text-gray-400 group-hover:text-red-600 group-hover:scale-110'
                                      }`}
                                  />
                                </button>

                                {/* <button className="p-1 rounded-full hover:bg-gray-100 transition-colors group">
                                                <RefreshCcw className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </button> */}

                                {/* Speech Button */}
                                {speech?.isSupported ? (
                                  <div className='relative group'>
                                    {speech?.isSpeaking &&
                                      speech?.currentSpeakingId === messageId ? (
                                      <button
                                        className='p-1 rounded-full hover:bg-gray-100 transition-colors'
                                        onClick={safeSpeechStop}
                                      >
                                        <Square className='h-4 w-4 text-blue-600 hover:text-blue-800 transition-colors' />
                                      </button>
                                    ) : (
                                      <button
                                        className='p-1 rounded-full hover:bg-gray-100 transition-colors'
                                        onClick={() =>
                                          safeSpeechToggle(text, messageId)
                                        }
                                      >
                                        <Volume2 className='h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors' />
                                      </button>
                                    )}
                                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
                                      {speech?.isSpeaking &&
                                        speech?.currentSpeakingId === messageId
                                        ? 'Stop speaking'
                                        : 'Read aloud'}
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    className='p-1 rounded-full cursor-not-allowed'
                                    disabled
                                  >
                                    <VolumeX
                                      className='h-4 w-4 text-gray-300'
                                      title='Text-to-speech not supported'
                                    />
                                  </button>
                                )}

                                {/* Copy Button */}
                                <button
                                  className='p-1 rounded-full hover:bg-gray-100 transition-colors group'
                                  onClick={() =>
                                    safeCopyToClipboard(text, copyToClipboard)
                                  }
                                >
                                  <Copy className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
                                </button>
                              </div>
                            )}

                            {/* Inline Feedback Form */}
                            {sender === 'bot' && showFeedbackForm && (
                              <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2 shadow-sm'>
                                <div className='flex items-start justify-between mb-3'>
                                  <div>
                                    <h4 className='text-sm font-medium text-gray-800 mb-1'>
                                      Help us improve
                                    </h4>
                                    <p className='text-xs text-gray-600'>
                                      What was the issue with this response?
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleFeedbackCancel(messageId)
                                    }
                                    className='text-gray-400 hover:text-gray-600 transition-colors'
                                  >
                                    <X className='h-4 w-4' />
                                  </button>
                                </div>

                                {/* Pre-defined feedback options */}
                                <div className='mb-4'>
                                  <div className='grid grid-cols-1 gap-2'>
                                    {feedbackOptions.map(option => (
                                      <Checkbox
                                        key={option}
                                        checked={selectedOptions.includes(
                                          option
                                        )}
                                        onChange={e =>
                                          handleOptionChange(
                                            messageId,
                                            option,
                                            e.target.checked
                                          )
                                        }
                                        className='text-sm'
                                      >
                                        <span className='text-gray-700 text-sm'>
                                          {option}
                                        </span>
                                      </Checkbox>
                                    ))}
                                  </div>
                                </div>

                                {/* Custom feedback text area */}
                                <div className='mb-3'>
                                  <label className='block text-xs text-gray-600 mb-2'>
                                    Other (optional)
                                  </label>
                                  <TextArea
                                    placeholder='Tell us what else went wrong...'
                                    value={feedbackText}
                                    onChange={e =>
                                      updateFeedbackText(
                                        messageId,
                                        e.target.value
                                      )
                                    }
                                    rows={3}
                                    maxLength={500}
                                    style={{
                                      resize: 'none',
                                      fontSize: '13px'
                                    }}
                                  />
                                </div>

                                <div className='flex items-center justify-between'>
                                  <span className='text-xs text-gray-500'>
                                    {feedbackText.length}/500
                                  </span>
                                  <div className='flex space-x-2'>
                                    <button
                                      onClick={() =>
                                        handleFeedbackCancel(messageId)
                                      }
                                      className='px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleFeedbackSubmit(messageId)
                                      }
                                      disabled={
                                        !feedbackText.trim() &&
                                        selectedOptions.length === 0
                                      }
                                      className='px-3 py-1.5 text-xs text-white bg-[#005BA1] rounded-lg hover:bg-[#004A87] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1'
                                    >
                                      <Send className='h-3 w-3' />
                                      <span>Submit</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* User Avatar Spacer */}
                          {sender === 'user' && (
                            <div className='w-8 ml-3 flex-shrink-0'></div>
                          )}
                        </div>
                      )
                    })}

                  {/* Loading Indicator */}
                  {loading && (
                    <div className='flex flex-col mt-3 justify-start'>
                      <div className='flex items-start'>
                        <img
                          src={nia_logo_animated}
                          alt='NIA'
                          className='w-10 h-6 object-cover rounded-full flex-shrink-0 mt-1 '
                        />
                        <div className='max-w-lg rounded-lg bg-[#E7E7E7] animate-pulse'>
                          <LoadingIndicator
                            pendingRequestMessageId={pendingRequestMessageId}
                            pendingRequestUniqueId={pendingRequestUniqueId}
                            sessionId={sessionId}
                          />


                        </div>
                      </div>
                      {/* Live Counter */}
                      {requestStartTime && (
                        <div className='flex items-center mt-2 ml-10'>
                          <span className='text-xs text-gray-500'>Waiting for response</span>
                          <LiveCounter startTime={requestStartTime} />
                        </div>
                      )}

                      {/* Thinking Indicator - Shows agent reasoning steps */}
                      <ThinkingIndicator
                        pendingRequestMessageId={pendingRequestMessageId}
                        pendingRequestUniqueId={pendingRequestUniqueId}
                        sessionId={sessionId}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className='mb-4 mx-7 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'>
                      <div className='p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='relative flex-shrink-0'>
                            <div className='absolute inset-0 rounded-full ring-2 ring-blue-400 animate-ping'></div>
                            <img
                              src={NiaMascot}
                              alt='Assistant'
                              className='w-10 h-10 rounded-full ring-2 ring-blue-200 shadow-sm relative'
                              onError={e => {
                                e.target.style.display = 'none'
                                console.warn('Failed to load bot avatar')
                              }}
                            />
                            <div className='absolute -bottom-2 -right-2.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-bounce'>
                              <div className='w-2 h-2 bg-white rounded-full'></div>
                            </div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2'>
                              <h4 className='text-sm font-semibold text-blue-900'>
                                Nia
                              </h4>
                              <span className='px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full'>
                                Just now
                              </span>
                            </div>
                            <p className='text-sm text-gray-700 leading-relaxed'>
                              {typeof error === 'string'
                                ? error
                                : 'I encountered an issue while processing your request. Would you like me to try again?'}
                            </p>
                          </div>

                          <button
                            className='flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md'
                            onClick={() => handleSendMessage()}
                          >
                            Try Again
                          </button>
                        </div>
                      </div>

                      <div className='px-4 py-3 bg-white/60 backdrop-blur-sm border-t border-blue-100'>
                        <div className='flex items-center gap-2 text-xs text-blue-600'>
                          <svg
                            className='w-3.5 h-3.5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          <span>
                            If this continues, feel free to reach out to our
                            support team for assistance
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className='flex-1 overflow-y-auto scrollbar-hidden p-3 px-3 space-y-2 min-h-0 chat-messages-container'>
                  {/* <SkeletonUtility type="conversation-pairs" pairs={20} /> */}
                  <NiaSkeleton />
                </div>
              )}

              {/* Scroll Navigation */}
              {Array.isArray(messages) &&
                messages.length > 0 &&
                (showUpArrow || showDownArrow) && (
                  <div className='absolute right-[5px] bottom-52 transform -translate-y-1/2 flex flex-col space-y-2 z-10'>
                    {showUpArrow && (
                      <button
                        onClick={safeScrollToTop}
                        className='group bg-white  hover:bg-slate-50 border border-gray-300 rounded-full p-0.5 shadow-lg transition-all duration-200 hover:shadow-xl'
                        title='Scroll to top'
                      >
                        <ChevronUp className='h-4 w-4 text-gray-600 group-hover:text-blue-600' />
                      </button>
                    )}
                    {showDownArrow && (
                      <button
                        onClick={safeScrollToBottom}
                        className='group bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-0.5 shadow-lg transition-all duration-200 hover:shadow-xl'
                        title='Scroll to bottom'
                      >
                        <ChevronDown className='h-4 w-4 text-gray-600 group-hover:text-blue-600' />
                      </button>
                    )}
                  </div>
                )}

              {/* Input Component */}
              <div className='bg-[#F6F6FD] p-3 pb-2 flex-shrink-0'>

                {/* Suggested Prompts - only show when no messages */}
                {(!Array.isArray(messages) || messages.length === 0) && (
                  <div className='mt-2 mb-2'>
                    <p className='text-xs text-[#26215B] font-semibold mb-1.5'>
                      Suggested Prompts:
                    </p>
                    <div className='flex flex-wrap gap-1.5 justify-center'>
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
                              if (setInput) {
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
                              }
                            }}
                            className='px-2.5 py-1 text-xs text-[#3E3696] bg-white border border-[#DEE4EE] rounded-2xl hover:bg-[#EAE8FF] hover:border-[#5C53C0] transition-all duration-200'
                          >
                            {prompt}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {InputComponent ? (
                  <InputComponent
                    input={input}
                    setInput={setInput}
                    loading={loading}
                    uploadedFiles={uploadedFiles}
                    uploadingFiles={uploadingFiles}
                    onInputChange={safeHandleInputChange}
                    onKeyPress={e => {
                      try {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          safeHandleSendMessage()
                        }
                      } catch (error) {
                        console.error('Error handling key press:', error)
                      }
                    }}
                    onSendMessage={safeHandleSendMessage}
                    onUploadFile={handleUploadFile}
                    onFilesDrop={onFilesDrop}
                    onRemoveFile={handleRemoveFile}
                    onRemoveUploadingFile={handleRemoveUploadingFile}
                    isHomeState={false}
                    onSparkle={onSparkle}
                    onSparkleLoading={promptEnhancerLoading}
                    onSpeechToggle={handleSpeechToggle}
                    speechToText={speechToText}
                  />
                ) : (
                  <div className='text-gray-500 p-4 text-center'>
                    Input component not available
                  </div>
                )}



                {/* Footer */}
                <div className='text-center my-2 '>
                  <div className='text-[10px] text-[#717196]'>
                    Copyright © {new Date().getFullYear()}. YASH Technologies.
                    All Rights Reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* {currentActiveTabforSwitch === 'workspace' &&
        (currentActiveSession && currentActiveSession.workspace ? (
          <Workspace key={currentActiveSession.workspace.id}>
            
          </Workspace>
        ) : (
          ''
        ))} */}
    </>
  )
}

export default ChatComponent
