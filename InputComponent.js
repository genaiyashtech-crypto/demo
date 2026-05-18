"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Input, Button, Tooltip } from "antd";
import {
  CloseOutlined,
  CheckCircleFilled,
  WarningFilled,
  LoadingOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import {
  Paperclip,
  SendHorizonal,
  Sparkle,
  MicOff,
  Mic,
  Loader2,
  Circle,
} from "lucide-react";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { mimetypes } from "../../../utils/constants";


const sparkleStyles = `
  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    25% {
      opacity: 0.8;
      transform: scale(1.15) rotate(90deg);
    }
    50% {
      opacity: 1;
      transform: scale(1.1) rotate(180deg);
    }
    75% {
      opacity: 0.9;
      transform: scale(1.2) rotate(270deg);
    }
  }

  /* ... other existing keyframes ... */
  
  .drop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(239, 246, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px; /* Matches rounded-3xl */
    z-index: 50;
    pointer-events: none; /* Let events pass through to container, or handle manually */
  }
  
  .drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #3b82f6;
    font-weight: 500;
  }

  @keyframes shimmer {
    0% {
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.4), 0 0 16px rgba(99, 102, 241, 0.2);
    }
    50% {
       box-shadow: 0 0 24px rgba(99, 102, 241, 0.6), 0 0 32px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3);
    }
    100% {
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.4), 0 0 16px rgba(99, 102, 241, 0.2);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
      transform: scale(1);
    }
    50% {
      background: linear-gradient(135deg, #8b5cf6, #ec4899, #6366f1);
      transform: scale(1.02);
    }
  }

  @keyframes listening-pulse {
    0%, 100% {
        background: rgba(59, 130, 246, 0.08);
        border-color: #3b82f6;
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
    }
    50% {
      background: rgba(59, 130, 246, 0.12);
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
  }

  @keyframes wave-border {
    0% {
        clip-path: polygon(0% 0%, 8% 3px, 16% 1px, 24% 4px, 32% 2px, 40% 5px, 48% 1px, 56% 3px, 64% 4px, 72% 2px, 80% 5px, 88% 1px, 96% 3px, 100% 2px, 100% 100%, 0% 100%);
    }
    25% {
        clip-path: polygon(0% 3px, 8% 1px, 16% 5px, 24% 2px, 32% 4px, 40% 1px, 48% 5px, 56% 3px, 64% 1px, 72% 4px, 80% 2px, 88% 5px, 96% 1px, 100% 4px, 100% 100%, 0% 100%);
    }
    50% {
        clip-path: polygon(0% 1px, 8% 5px, 16% 3px, 24% 1px, 32% 5px, 40% 2px, 48% 4px, 56% 1px, 64% 5px, 72% 3px, 80% 1px, 88% 4px, 96% 2px, 100% 5px, 100% 100%, 0% 100%);
    }
    75% {
        clip-path: polygon(0% 4px, 8% 2px, 16% 4px, 24% 5px, 32% 1px, 40% 4px, 48% 2px, 56% 5px, 64% 2px, 72% 1px, 80% 4px, 88% 3px, 96% 5px, 100% 1px, 100% 100%, 0% 100%);
    }
    100% {
        clip-path: polygon(0% 0%, 8% 3px, 16% 1px, 24% 4px, 32% 2px, 40% 5px, 48% 1px, 56% 3px, 64% 4px, 72% 2px, 80% 5px, 88% 1px, 96% 3px, 100% 2px, 100% 100%, 0% 100%);
    }
  }

  @keyframes wave-glow {
    0%, 100% {
      box-shadow:
        0 -3px 12px rgba(16, 185, 129, 0.4),
        0 -6px 24px rgba(16, 185, 129, 0.3),
        0 -9px 36px rgba(16, 185, 129, 0.2);
    }
    50% {
      box-shadow:
        0 -4px 16px rgba(16, 185, 129, 0.6),
        0 -8px 32px rgba(16, 185, 129, 0.4),
        0 -12px 48px rgba(16, 185, 129, 0.3);
    }
  }

  /* Enhanced wave border container */
}

  .sparkle - button:hover {
  animation: shimmer 2.5s ease -in -out infinite;
  transform: translateY(-1px);
}

  .sparkle - button.active {
  animation: pulse - glow 2.5s ease -in -out infinite;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

  .sparkle - button.active.sparkle - icon {
  animation: sparkle 0.6s ease -in -out infinite;
}

  /* Enhanced Google AI Style Mic Button */
  .google - ai - mic {
  position: relative;
  border - radius: 50 %;
  background: linear - gradient(135deg, #3b82f6, #2563eb, #1d4ed8);
  animation: mic - pulse 2.2s ease -in -out infinite, glow - intensity 3.5s ease -in -out infinite;
  border: 2px solid rgba(59, 130, 246, 0.3); /* blue-500 @ 30% */

}

  .google - ai - mic:: before,
  .google - ai - mic::after {
  content: '';
  position: absolute;
  top: 50 %;
  left: 50 %;
  transform: translate(-50 %, -50 %);
  border - radius: 50 %;
  border: 1.5px solid rgba(59, 130, 246, 0.5); /* blue-500 @ 50% */

  pointer - events: none;
}

  .google - ai - mic::before {
  width: 160 %;
  height: 160 %;
  animation: wave - pulse 1.8s ease - out infinite;
}

  .google - ai - mic::after {
  width: 190 %;
  height: 190 %;
  // animation: wave-pulse-2 2.4s ease-out infinite 0.4s;
}

  /* Enhanced wave effects */
  .mic - waves {
  position: absolute;
  top: 50 %;
  left: 50 %;
  transform: translate(-50 %, -50 %);
  pointer - events: none;
}

.mic - wave: nth - child(1) {
  width: 50px;
  height: 50px;
  margin: -25px 0 0 - 25px;
  animation: wave - pulse - 3 3s ease - out infinite;
}

.mic - wave: nth - child(2) {
  width: 70px;
  height: 70px;
  margin: -35px 0 0 - 35px;
  animation: wave - pulse - 3 3s ease - out infinite 0.6s;
}

.mic - wave: nth - child(3) {
  width: 90px;
  height: 90px;
  margin: -45px 0 0 - 45px;
  animation: wave - pulse - 3 3s ease - out infinite 1.2s;
}


  /* Enhanced breathing animation */
  .mic - breath {
  animation: breath 3.5s ease -in -out infinite;
  transition: all 0.3s ease;
}

  .mic - breath:hover {
  transform: translateY(-2px) scale(1.05);
}

  /* Enhanced sparkle effects */
  .sparkle - button:: before,
  .sparkle - button::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  background: radial - gradient(circle, #ffffff 0 %, rgba(255, 255, 255, 0.8) 70 %, transparent 100 %);
  border - radius: 50 %;
  opacity: 0;
  pointer - events: none;
}

  .sparkle - button: hover::before {
  top: 25 %;
  left: 25 %;
  animation: twinkle 2s ease -in -out infinite;
}

  .sparkle - button: hover::after {
  bottom: 25 %;
  right: 25 %;
  animation: twinkle 2s ease -in -out infinite 0.7s;
}

@keyframes twinkle {
  0 %, 100 % {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50 % {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}


  /* Custom Scrollbar Styles - Matches QuickTopics */
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px; /* w-1.5 equivalent */
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6; /* gray-100 */
    border-radius: 9999px; /* rounded-full */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #9ca3af; /* gray-400 */
    border-radius: 9999px; /* rounded-full */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280; /* gray-500 */
  }

  /* Enhanced file upload styling */
  .file-upload-item {
  background: #EFF6FF;
  border: 1px solid #e2e8f0;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

  // .file-upload-item:hover {
  //   transform: translateY(-1px);
  //   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.1);
  //   border-color: #cbd5e1;
  // }

  /* Enhanced button styling */
  .action - button {
  transition: all 0.2s cubic - bezier(0.4, 0, 0.2, 1);
  border - radius: 8px;
  backdrop - filter: blur(4px);
}

  .action - button:hover {
  transform: translateY(-1px);
  box - shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

  .action - button:active {
  transform: translateY(0);
}

/* Enhanced textarea styling */
//   .enhanced-textarea {
//     border-radius: 12px !important;
//     border: 2px solid #1677ff !important;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02) !important;
//     transition: all 0.3s ease !important;
//   }

//   .enhanced-textarea:focus {
//     border-color: #1677ff !important;
//     box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04) !important;
//   }

//   .enhanced-textarea:hover:not(:focus) {
//     border-color: #1677ff !important;
//   }
// `;

const InputComponent = ({
  input,
  loading,
  uploadedFiles,
  uploadingFiles = [],
  onInputChange,
  onKeyPress,
  onSendMessage,
  onUploadFile,
  setInput,
  onRemoveFile,
  onTextAreaEnhance,
  onRemoveUploadingFile,
  isHomeState = false,
  onSparkle,
  onSparkleLoading,
  onSpeechToggle,
  speechToText,
  onFilesDrop,
}) => {
  // Fixed Redux selector - get the actual currentActiveTeams data from state
  const { currentActiveTeams, currentActiveAgent, s3UploadedAttachmentsList } = useSelector(
    (state) => state.chat
  );


  // const { currentActiveTabforSwitch } = useSelector(
  //     state => state.chat
  //   )


  //   const isChatTab  = currentActiveTabforSwitch === "chat" ? true : false;





  // Check if we have a team_id, if not, use initial chat
  const hasActiveTeam = currentActiveTeams?.team_id;

  const [textareaValue, setTextareaValue] = useState("");
  const promptTemplate = currentActiveAgent?.agent_constraints?.prompt_template;
  const promptVariables =
    currentActiveAgent?.agent_constraints?.prompt_template_variable_name;
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (isHomeState && typeof textareaValue === "string") {
      setInput(textareaValue);
    }
  }, [isHomeState, textareaValue]);

  const value = input;

  // Prefill logic (only when entering home state)
  useEffect(() => {
    if (isHomeState) {
      console.log("Entering home state, pre-filling textarea");
      if (promptTemplate?.length) {
        let preFilled = promptTemplate[0];
        promptVariables?.forEach((v) => {
          preFilled = preFilled.replace(`{{${v}}}`, `.__${v}__.`);
        });
        setTextareaValue(preFilled);
      } else {
        setTextareaValue("");
      }
    } else {
      console.log("Exiting home state, clearing textarea");
      setTextareaValue("");
      // setInput("");
      console.log("Cleared textareaValue:", textareaValue);
      console.log("Current input value:", input);
    }
  }, [isHomeState, currentActiveAgent, promptTemplate, promptVariables]);

  const handleChange = (e) => {
    console.log("handleChange:", e.target.value);
    setTextareaValue(e.target.value);
    onInputChange?.(e);
  };

  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading && !speechToText.isListening) {
      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading && !speechToText.isListening) {
      // setIsDragging(true); // handled by enter
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (loading || speechToText.isListening) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (onFilesDrop) {
        onFilesDrop(files);
      }
    }
  };

  const placeholders = promptVariables?.map((v) => `.__${v}__.`) || [];

  const hasUnfilledPromptVariables = () => {
    // Check the actual input value (which is used for display) for placeholders
    const valueToCheck = input || textareaValue || "";
    return placeholders.some((ph) => valueToCheck.includes(ph));
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = sparkleStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    console.log("InputValue", input);
    console.log("textarea", textareaValue);
  }, [input, textareaValue]);

  // Enhanced speech-to-text integration
  useEffect(() => {
    if (speechToText.transcript && speechToText.transcript.trim()) {
      const currentTranscript = speechToText.transcript.trim();
      // Only update if transcript is different from current input
      if (currentTranscript !== input.trim()) {
        onInputChange({ target: { value: currentTranscript } });
      }
    }
  }, [speechToText.transcript, input, onInputChange]);

  // Auto-cleanup transcript when speech stops
  useEffect(() => {
    if (!speechToText.isListening && speechToText.transcript) {
      // Clear transcript after a delay to allow for final processing
      const timeoutId = setTimeout(() => {
        speechToText.resetTranscript();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [speechToText.isListening, speechToText.transcript]);

  const renderFileStatusIcon = (file) => {
    if (file.status === "uploading") {
      return <LoadingOutlined className="text-indigo-500" />;
    }
    if (file.status === "completed") {
      return <CheckCircleFilled className="text-emerald-500" />;
    }
    if (file.status === "error") {
      return <WarningFilled className="text-rose-500" />;
    }
    return <PaperClipOutlined className="text-slate-500" />;
  };

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  const activeUploadingFiles = uploadingFiles.filter(
    (f) => !uploadedFiles.some((uploaded) => uploaded.filename === f.filename)
  );

  const allFiles = [
    ...uploadedFiles.map((f) => ({ ...f, type: "uploaded" })),
    ...activeUploadingFiles.map((f) => ({ ...f, type: "uploading" })),
  ];

  // Check if any files are still uploading
  const hasUploadingFiles = activeUploadingFiles.some(
    (file) =>
      file.status === "uploading" || !file.status || file.status === "pending"
  );

  // Enhanced send message check - prevent sending until team is selected
  const canSendMessage =


    !loading &&
    input.trim() &&
    !hasUploadingFiles &&
    !speechToText.isListening &&
    hasActiveTeam &&
    !hasUnfilledPromptVariables()
    && value.length <= 1000
    ;

  // Helper function to get tooltip titles
  const getSparkleTooltip = () => {
    if (!hasActiveTeam) return "Please select a team first to enhance messages";
    if (onSparkleLoading) return "AI is enhancing your message...";
    if (hasUploadingFiles) return "Wait for files to finish uploading";
    if (speechToText.isListening) return "Stop voice input before enhancing";
    if (!input.trim()) return "Enter a message to enhance with AI";
    return "Enhance your message with AI";
  };

  const disableSparkle =
    onSparkleLoading ||
    hasUploadingFiles ||
    speechToText.isListening ||
    !hasActiveTeam ||
    !input.trim();

  const getSendTooltip = () => {
    if (!hasActiveTeam) return "Please select a team first to send messages";
    if (loading) return "Sending message...";
    if (hasUploadingFiles) return "Wait for files to finish uploading";
    if (speechToText.isListening) return "Stop voice input before sending";
    if (!input.trim()) return "Enter a message to send";
    if (hasUnfilledPromptVariables())
      return "Please fill all placeholders before sending";
    if (value.length > 1000) return "Message exceeds the 1000 character limit";

    return "Send message (Enter)";
  };
  const disableSend = !canSendMessage || value.length > 1000;

  const getSpeechTooltip = () => {
    if (!hasActiveTeam) return "Please select a team first to use voice input";
    if (!speechToText.isSupported)
      return "Speech recognition not supported in your browser";
    if (!speechToText.isInitialized)
      return "Initializing speech recognition...";
    if (loading) return "Voice input disabled while processing";
    if (speechToText.isListening)
      return "Click to stop listening (or wait for auto-stop)";
    return "Click to start voice input";
  };
  const disableSpeech =
    loading ||
    !speechToText.isSupported ||
    !speechToText.isInitialized ||
    !hasActiveTeam;

  const getUploadTooltip = () => {
    if (!hasActiveTeam) return "Please select a team first to upload files";
    if (!currentActiveAgent) return "Please select an agent to upload files";
    if (loading) return "Uploading files...";
    if (hasUploadingFiles) return "Wait for files to finish uploading";
    if (speechToText.isListening) return "Stop voice input before uploading";

    if (
      currentActiveAgent?.agent_constraints &&
      currentActiveAgent?.agent_constraints.max_files === 0
    ) {
      return "File uploads are disabled for this agent";
    }
    const constraints = currentActiveAgent?.agent_constraints;
    let fileTypes = "";
    let maxSize = "";
    let maxFiles = "";

    if (constraints) {
      if (constraints.supported_file_types?.length) {
        let acceptedFiles = [];
        let seenKeys = new Set();
        let seenCategories = new Set();

        constraints.supported_file_types.forEach((allowed) => {
          const lower = allowed.toLowerCase().replace(/^\./, "");
          let foundCategory = null;

          if (mimetypes) {
            Object.keys(mimetypes).forEach((category) => {
              const categoryObj = mimetypes[category];
              if (typeof categoryObj === "object") {
                Object.keys(categoryObj).forEach((k) => {
                  const parts = k.split("/");
                  const keyExt = parts.length > 1 ? parts[1] : k;

                  if (
                    (keyExt === lower ||
                      categoryObj[k].toLowerCase().endsWith(lower)) &&
                    !seenKeys.has(k)
                  ) {
                    foundCategory = category;
                    seenKeys.add(k);
                  }
                });
              }
            });
          }

          if (foundCategory && !seenCategories.has(foundCategory)) {
            acceptedFiles.push(foundCategory);
            seenCategories.add(foundCategory);
          }
        });

        if (acceptedFiles.length > 0) {
          fileTypes = acceptedFiles.join(", ");
        } else {
          fileTypes = constraints.supported_file_types.join(", ");
        }
      }

      if (constraints.max_file_size) {
        maxSize = `${parseFloat(constraints.max_file_size)} mb`;
      }

      if (constraints.max_files) {
        maxFiles = `${constraints.max_files}`;
      }
    }

    if (fileTypes || maxSize || maxFiles) {
      return (
        <div className="p-2">
          <div className="flex flex-col gap-y-1 items-start text-[14px]">
            {fileTypes && (
              <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-[#3C3B69] tracking-wide whitespace-nowrap">Supported Formats:</div>
                <div className="text-left font-medium text-[#26215B]">{fileTypes}</div>
              </div>
            )}
            {maxSize && (
              <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-[#3C3B69] tracking-wide whitespace-nowrap">Maximum size:</div>
                <div className="text-left font-medium text-[#26215B]">{maxSize}</div>
              </div>
            )}
            {maxFiles && (
              <div className="flex flex-row items-center gap-2">
                <div className="font-semibold text-[#3C3B69] tracking-wide whitespace-nowrap">Number of attachments:</div>
                <div className="text-left font-medium text-[#26215B]">{maxFiles}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return "Upload files";
  };
  const disableUpload =
    loading ||
    hasUploadingFiles ||
    speechToText.isListening ||
    !hasActiveTeam ||
    !currentActiveAgent ||
    (currentActiveAgent?.agent_constraints &&
      uploadedFiles.length >= currentActiveAgent.agent_constraints.max_files) ||
    (currentActiveAgent?.agent_constraints &&
      uploadedFiles.length + activeUploadingFiles.length >=
      currentActiveAgent.agent_constraints.max_files);

  // Enhanced key press handler
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSendMessage) {
          // Stop speech recognition if active before sending
          if (speechToText.isListening) {
            speechToText.stopListening();
          }
          onSendMessage();
        }
      }
    },
    [canSendMessage, onSendMessage, speechToText]
  );

  // Enhanced speech toggle handler
  const handleSpeechToggle = useCallback(() => {
    if (loading || !hasActiveTeam) return;

    if (speechToText.error) {
      speechToText.clearError();
    }

    onSpeechToggle();
  }, [speechToText, loading, onSpeechToggle, hasActiveTeam]);

  return (
    <div
      className={`w-full ${!isHomeState && "chat-state"}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >


      <div className="space-y-3">
        {/* Enhanced file upload display */}
        {allFiles.length > 0 ? (
          <div className="flex  overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-0 gap-2">
            {allFiles.map((f) => (
              <div
                key={f.id}
                className="file-upload-item flex-shrink-0 min-w-[150px] max-w-[170px] rounded-xl pl-3 pr-1 py-2.5"
              >
                {console.log(f)}

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">{renderFileStatusIcon(f)}</div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-medium text-slate-900 truncate"
                      title={f.filename}
                    >
                      {f.filename}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {formatFileSize(f.size)}
                    </div>
                  </div>
                  {(f.type === "uploaded" || f.status === "error") && (
                    <Tooltip
                      title={
                        f.status === "error"
                          ? "Remove failed upload"
                          : "Remove file"
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() =>
                          f.type === "uploaded"
                            ? onRemoveFile(f)
                            : onRemoveUploadingFile(f.id)
                        }
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full p-1 transition-all duration-200"
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          isHomeState ? (
            // <div className="h-[50px]">
            // </div>
            ''
          ) : null
        )}



        {/* Enhanced listening indicator with refined Google AI style */}
        {speechToText.isListening && (
          <div className="flex items-center justify-center -pb-8">
            <div className="relative">
              {/* Animated waves background */}
              <div className="mic-waves">
                <div className="mic-wave"></div>
                <div className="mic-wave"></div>
                <div className="mic-wave"></div>
              </div>

              {/* Central microphone button */}
              <button
                onClick={handleSpeechToggle}
                className="google-ai-mic relative w-18 h-18 flex items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
                title="Stop listening"
              >
                <Mic className="w-7 h-7 relative z-10" />
              </button>
            </div>

            {/* Enhanced status text */}
            <div className="ml-8">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                  <div
                    className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg"
                    style={{ animationDelay: "0.6s" }}
                  ></div>
                </div>
                <span className="text-blue-600 text-xl font-bold">
                  Listening...
                </span>
              </div>
              <p className="text-blue-600 text-sm font-medium">
                Speak clearly, I'll auto-stop after 3 seconds of silence
              </p>
              {speechToText.transcript && (
                <p className="text-slate-700 text-sm mt-3 italic font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  "{speechToText.transcript}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced speech recognition error display */}
        {speechToText.error && (
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl shadow-sm">
            <div className="flex-1">
              <p className="text-rose-700 text-sm font-bold">
                Speech Recognition Error
              </p>
              <p className="text-rose-600 text-xs mt-1 font-medium">
                {speechToText.error}
              </p>
            </div>
            <button
              onClick={() => speechToText.clearError()}
              className="text-rose-400 hover:text-rose-600 transition-colors duration-200 p-1 rounded-full hover:bg-rose-100"
              title="Clear error"
            >
              <CloseOutlined />
            </button>
          </div>
        )}

        <div
          className={`
    enhanced-textarea text-sm pb-2 transition-all duration-300 flex flex-col
    rounded-3xl relative
    ${loading && "opacity-50"}
    ${speechToText.isListening ? "listening-textarea" : ""}
  `}

          style={{
            background: speechToText.isListening
              ? "linear-gradient(white, white) padding-box, linear-gradient(to right, rgb(59, 130, 246), rgb(96, 165, 250)) border-box"
              : isDragging
                ? "#f0f9ff" // Light blue solid background when dragging
                : isFocused
                  ? "linear-gradient(white, white) padding-box, linear-gradient(to right, rgb(168, 85, 247), rgb(96, 165, 250), rgb(34, 211, 238)) border-box"
                  : "linear-gradient(white, white) padding-box, linear-gradient(to right, #DEE4EE, #DEE4EE) border-box",
            border: isDragging ? "2px dashed #3b82f6" : "2px solid transparent",
            boxShadow: speechToText.isListening
              ? "0px 4px 7px 1px rgba(59, 130, 246, 0.3)"
              : isDragging
                ? "0 0 0 4px rgba(59, 130, 246, 0.1)"
                : isFocused
                  ? "0px 4px 7px 1px rgba(92, 83, 192, 0.22)"
                  : "none"
          }}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-50/90 rounded-3xl backdrop-blur-[1px] transition-all duration-200 pointer-events-none">
              <div className="flex flex-col items-center animate-bounce text-blue-500">
                <Paperclip className="w-5 h-5 mb-2" />
                <span className="font-semibold text-base">Drop files to upload</span>
              </div>
            </div>
          )}
          <TextArea
            value={value}
            onChange={handleChange}
            onPressEnter={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            // maxLength={1000} // Set maxLength to 1000 characters
            placeholder={
              speechToText.isListening
                ? "Listening to your voice..."
                : isHomeState
                  ? "Ask NIA..."
                  : "Type your query here..."
            }
            disabled={loading}
            autoSize={{ minRows: 1, maxRows: 2 }}
            className="!w-full !min-w-0 border-0 shadow-none px-3 mt-2 mb-2
        focus:ring-0 focus:outline-none focus:shadow-none
        bg-transparent text-base leading-relaxed text-gray-700 placeholder:text-[#717196]"
            style={{
              resize: "none",
              boxShadow: "none",
              outline: "none",
              color: hasUnfilledPromptVariables() ? "#9ca3af" : "#111827", // fade only if real placeholders exist
            }}
          />

          <div className="text-right text-[11px] mr-3 text-gray-400">
            {value.length > 1000 && (
              <span className="text-[11px] text-rose-600  font-semibold">
                You have exceeded the 1000 character limit.
              </span>
            )} {value.length}/1000
          </div>

          {/* Action row (bottom overlay) */}
          <div className="flex items-center justify-between ">
            {/* sparkle (left) */}
            <Tooltip title={getSparkleTooltip()}>
              <button
                onClick={onSparkle}
                disabled={disableSparkle}
                className={`
        ml-2  p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          ${onSparkleLoading
                    ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow-lg"
                    : "hover:bg-blue-500 hover:text-white text-blue-600 bg-white/80"
                  }
        `}
              >
                {onSparkleLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkle className="w-4 h-4" />
                )}
              </button>
            </Tooltip>

            {/* right actions */}
            <div className="flex items-center gap-2 mr-2">
              {/* mic */}
              <Tooltip title={getSpeechTooltip()}>
                <button
                  onClick={handleSpeechToggle}
                  disabled={disableSpeech}
                  className={`
            p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            ${speechToText.isListening
                      ? "bg-red-50 text-red-600 shadow"
                      : "hover:bg-blue-500 hover:text-white text-blue-600 bg-white/80"
                    }
          `}
                >
                  {speechToText.isListening ? (
                    <Circle
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-red-600"
                    />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              </Tooltip>

              {/* upload */}
              {(() => {
                const tooltipContent = getUploadTooltip();
                const isComplexTooltip = typeof tooltipContent === 'object';

                return (
                  <Tooltip
                    title={tooltipContent}
                    placement={isComplexTooltip ? "topLeft" : "top"}
                    color={isComplexTooltip ? "#eff6ff" : undefined}
                    overlayStyle={isComplexTooltip ? { maxWidth: 'none' } : undefined}
                    overlayInnerStyle={isComplexTooltip ? {
                      color: '#3C3B69',
                      backgroundColor: '#F6F6FD',
                      border: '1px solid #dbeafe',
                      borderRadius: '8px',
                      boxShadow: '0px 0px 3px -1px rgba(92, 83, 192, 1)'
                    } : undefined}
                  >
                    <button
                      onClick={onUploadFile}
                      disabled={disableUpload}
                      className="p-2 rounded-lg hover:bg-blue-500 hover:text-white text-blue-600 bg-white/80 disabled:opacity-50"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </Tooltip>
                );
              })()}
              {/* </Tooltip> */}

              {/* send */}
              <Tooltip title={getSendTooltip()} placement="topRight">
                <button
                  onClick={onSendMessage}
                  disabled={disableSend}
                  className="p-2 rounded-lg hover:bg-blue-500 hover:text-white text-blue-600 bg-white/80 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizonal className="w-4 h-4" />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default InputComponent;
