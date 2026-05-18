import React from 'react'
import nia_logo from '../../../assets/welcome_page_nia_logo.svg'
import TeamsSelection from '../../session/components/TeamsSelection'
import { useDispatch, useSelector } from 'react-redux'
import {
  setCurrentActiveTeams,
  setNewConversations,
  setCurrentActiveSession,
  setCurrentActiveAgent
} from '../../../redux/features/chat/chatSlice'
import { ChevronRight, Icon, Rocket } from 'lucide-react'
import { getAgentCards } from '../../../redux/features/chat/chatActions'

const WelcomePage = () => {
  const dispatch = useDispatch()
  const { currentLoggedInUserProfile } = useSelector(
    state => state.chat
  )
  const listAllUserTeams = useSelector(state => state.chat.userTeams?.data) || []
  const userName =
    currentLoggedInUserProfile?.name ||
    localStorage.getItem('user_name') ||
    'User'
  const firstName = userName.split(' ')[0]
  const userId = localStorage.getItem('user_id')
  const [selectedTeamId, setSelectedTeamId] = React.useState(null)

  const handleNext = () => {
    if (selectedTeamId) {
      const selectedTeam = listAllUserTeams?.find(
        team => team.team_id === selectedTeamId
      )
      if (selectedTeam) {
        dispatch(setCurrentActiveTeams(selectedTeam))
        dispatch(setNewConversations(true))
        dispatch(setCurrentActiveSession(null))
        dispatch(setCurrentActiveAgent(null))
        dispatch(getAgentCards({ userId, teamId: selectedTeamId }))
      }
    }
    // Add navigation or further logic here if needed
  }

  return (
    <div className='flex flex-col min-h-screen bg-white relative overflow-hidden'>
      {/* Gradient Line at Top */}
      <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400'></div>

      {/* Main Content */}
      <div className='flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-10'>
        {/* NIA Logo */}
        <div className='mb-6 w-full flex justify-center'>
          <img
            src={nia_logo}
            alt='NIA - Next-Gen Intelligent Agent'
            className='max-h-[84px] w-auto object-contain'
          />
        </div>

        {/* Welcome Card */}
        <div className='w-full bg-[#F6F6FD] rounded-2xl p-4 '>
          {/* Welcome Text */}
          <div className='text-center mb-4'>
            <h1 className='text-2xl font-medium text-[#3E3696] mb-1'>
              Welcome, {firstName}!
            </h1>
            <div className='text-xs sm:text-sm font-semibold text-[#717196]'>
              I'm NIA, your AI assistant
            </div>
          </div>

          {/* Getting Started Section */}
          <div className='flex items-center justify-center h-full mb-3'>
            <div
              className='flex items-center bg-[#EAE8FF] rounded-xl px-3 py-3'
              style={{ minWidth: 340 }}
            >
              <div className='flex items-center justify-center bg-[#F6F6FD] rounded-full w-12 h-12 mr-4'>
                <Rocket className='text-[#5C53C0]' size={20} />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs sm:text-sm font-semibold text-[#3E3696] mb-1'>
                  Let&apos;s get started,
                </span>
                <span className='text-[11px] sm:text-xs text-[#3E3696]'>
                  Choose your Team to see available Agents
                </span>
              </div>
            </div>
          </div>

          {/* Team Selection */}
          <div className='mb-4 px-1.5'>
            <TeamsSelection
              selectedTeamId={selectedTeamId}
              setSelectedTeamId={setSelectedTeamId}
              useLocalOnly
            />
          </div>

          {/* Next Button - Only selects team on click */}
          <div className='flex justify-center'>
            <button
              className={`flex items-center gap-1 px-2 py-1.5 bg-[#5C53C0] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#4a4299] transition-colors ${selectedTeamId ? '' : 'opacity-50 cursor-not-allowed'
                }`}
              disabled={!selectedTeamId}
              onClick={handleNext}
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='pb-3 text-center w-full mt-auto'>
        <div className='text-[10px] sm:text-xs text-[#717196]'>
          Copyright © {new Date().getFullYear()}. YASH Technologies. All Rights
          Reserved.
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
