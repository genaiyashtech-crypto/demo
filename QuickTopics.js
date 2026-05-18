import React, { useMemo, useState, useEffect, useRef } from 'react'
import * as Icons from 'lucide-react'
import { Input, Select, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { createFavorite } from '../../../redux/features/chat/chatActions'

// === Helpers from agentFiltersAndCardUtils.js ===

function extractIndustryDepartmentFunctionOptions(agents = [], selectedIndustry = 'all', selectedDepartment = 'all') {
  const industriesSet = new Set();
  const departmentsSet = new Set();
  const functionsSet = new Set();

  for (const agent of agents) {
    for (const industryObj of agent.industries || []) {
      if (industryObj.industry_name) {
        industriesSet.add(industryObj.industry_name);

        // Only add departments if this industry is selected or 'all' is selected
        if (selectedIndustry === 'all' || industryObj.industry_name === selectedIndustry) {
          for (const departmentObj of industryObj.departments || []) {
            const deptName = departmentObj.department_name;

            // SKIP backend "All Departments"
            if (!deptName || deptName.toLowerCase() === 'all departments') {
              continue;
            }

            departmentsSet.add(deptName);

            if (selectedDepartment === 'all' || deptName === selectedDepartment) {
              for (const functionObj of departmentObj.functions || []) {
                if (functionObj.function_name) {
                  functionsSet.add(functionObj.function_name);
                }
              }
            }
          }

        }
      }
    }
  }

  return {
    industries: [
      { value: "all", label: "All Industries" },
      ...[...industriesSet].sort().map(ind => ({ value: ind, label: ind })),
    ],
    departments: [
      { value: "all", label: "All Departments" },
      ...[...departmentsSet].sort().map(dep => ({ value: dep, label: dep })),
    ],
    functions: [
      { value: "all", label: "All Functions" },
      ...[...functionsSet].sort().map(fn => ({ value: fn, label: fn })),
    ],
  };
}

function agentNestedMatch(agent, selectedIndustry, selectedDepartment, selectedFunction) {
  if (
    (selectedIndustry === 'all' || !selectedIndustry) &&
    (selectedDepartment === 'all' || !selectedDepartment) &&
    (selectedFunction === 'all' || !selectedFunction)
  ) {
    return true;
  }

  for (const industry of agent.industries || []) {
    if (
      (selectedIndustry === 'all' || industry.industry_name === selectedIndustry)
    ) {
      for (const department of industry.departments || []) {
        if (
          (selectedDepartment === 'all' || department.department_name === selectedDepartment)
        ) {
          for (const func of department.functions || []) {
            if (
              (selectedFunction === 'all' || func.function_name === selectedFunction)
            ) {
              return true;
            }
          }
          if (selectedFunction === 'all') return true;
        }
      }
      if (selectedDepartment === 'all' && selectedFunction === 'all') return true;
    }
  }
  return false;
}

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

// === Main Component ===

export function QuickTopics({
  onTopicClick,
  initialShowAll = false,
  maxPreviewCount = 4
}) {
  const agents = useSelector(state => state.chat.allAgentCards?.data) || []
  const allAgentCardsLoading = useSelector(state => state.chat.allAgentCards?.loading) || false
  const { currentActiveAgent, currentActiveTeams } = useSelector(state => state.chat)
  const [activeTab, setActiveTab] = useState('all')
  const [optimisticFavorites, setOptimisticFavorites] = useState({})
  const dispatch = useDispatch();

  useEffect(() => {
    setShowAll(false)

    // ⬇️ ensure scroll resets when switching tabs
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({
        top: 0,
        behavior: 'auto', // instant, no animation
      })
    }
  }, [activeTab])


  useEffect(() => {
    const initial = {}
    for (const agent of agents || []) {
      initial[agent.agent_id] = agent.is_favorite
    }
    setOptimisticFavorites(initial)
  }, [agents])

  const onFavoriteClick = (agent) => {
    const isNowFavorite = !optimisticFavorites[agent.agent_id]
    setOptimisticFavorites({
      ...optimisticFavorites,
      [agent.agent_id]: isNowFavorite,
    });
    const requestData = {
      user_id: localStorage.getItem('user_id'),
      team_id: currentActiveTeams?.team_id,
      agent_id: agent?.agent_id,
      action: isNowFavorite ? "add" : "remove",
    };
    dispatch(createFavorite(requestData));
  };

  // Filters



  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedFunction, setSelectedFunction] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(initialShowAll)
  const cardsContainerRef = useRef(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const tabFilteredAgents = useMemo(() => {
    if (activeTab === 'favorites') {
      return (agents || []).filter(agent => optimisticFavorites[agent.agent_id])
    }
    return agents || []
  }, [agents, activeTab, optimisticFavorites])

  const activeFilters = useMemo(() => {
    const filters = []
    if (selectedIndustry !== 'all') filters.push({ type: 'industry', value: selectedIndustry })
    if (selectedDepartment !== 'all') filters.push({ type: 'department', value: selectedDepartment })
    if (selectedFunction !== 'all') filters.push({ type: 'function', value: selectedFunction })
    return filters
  }, [selectedIndustry, selectedDepartment, selectedFunction])

  const { industries, departments, functions } = useMemo(
    () =>
      extractIndustryDepartmentFunctionOptions(
        agents,
        selectedIndustry,
        selectedDepartment
      ),
    [agents, selectedIndustry, selectedDepartment]
  )

  const removeFilter = type => {
    if (type === 'industry') setSelectedIndustry('all')
    if (type === 'department') setSelectedDepartment('all')
    if (type === 'function') setSelectedFunction('all')
  }


  const clearAllFilters = () => {
    setSelectedIndustry('all')
    setSelectedDepartment('all')
    setSelectedFunction('all')
  }

  const filteredAgents = useMemo(() => {
    return (tabFilteredAgents || []).filter(agent => {
      const matchesFilter = agentNestedMatch(
        agent,
        selectedIndustry,
        selectedDepartment,
        selectedFunction
      )
      const text = (
        (agent.agent_name || '') +
        ' ' +
        (agent.agent_description || '') +
        ' ' +
        (agent.example_prompt || '') +
        ' ' +
        (agent.tagline || '')
      ).toLowerCase()
      const matchesSearch =
        !searchQuery || text.includes(searchQuery.trim().toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [tabFilteredAgents, selectedIndustry, selectedDepartment, selectedFunction, searchQuery])

  const filteredAgentsNoShared = filteredAgents.filter(agent => agent.agentScope !== 'SHARED_WORKSPACE')
  const displayedAgents = filteredAgentsNoShared


  const handleIndustryChange = value => {
    setSelectedIndustry(value)
    setSelectedDepartment('all')
    setSelectedFunction('all')
  }

  const handleDepartmentChange = value => {
    setSelectedDepartment(value)
    setSelectedFunction('all')
  }



  return (
    <div className='flex flex-col px-4 sm:px-8 md:px-12 relative items-center flex-shrink-0'>
      <div className='w-full max-w-[1200px] pt-3 flex flex-col'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2'>
          <div className='text-left'>
            <h2 className='text-xl sm:text-2xl font-bold text-[#3E3696]'>
              Agents Assigned to You
            </h2>
            <p className='text-sm font-semibold text-[#717196]'>
              Choose an AI agent specialized for your task
            </p>
          </div>
          {/* Search and Filter */}
          <div className='flex items-center gap-3 relative' id='search-filter-container'>
            <Input
              placeholder='Search agents, actions or docs'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              allowClear
              prefix={<SearchOutlined className='text-[#5C53C0] text-lg font-semibold mr-2 ml-2' />}
              className='w-64 h-9  bg-[#EAE8FF] border rounded-xl border-gray-200 placeholder:text-[#3C3B69]'
            />
            <button
              className={`p-2 rounded-xl transition-colors ${showFilterPanel
                ? 'bg-[#EAE8FF] text-[#5C53C0]'
                : 'bg-[#EAE8FF] text-[#5C53C0] hover:bg-[#DDD8FF]'
                }`}
              aria-label='Filter agents'
              onClick={() => setShowFilterPanel(prev => !prev)}
            >
              <Icons.Filter size={14} className='text-[#5F6368]' />
            </button>
            {
              showFilterPanel && (
                <div className='absolute right-1 top-full bg-white border border-gray-200 rounded-2xl shadow-lg p-2.5 mt-1 w-80 z-10'>
                  {/* Header */}
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-3'>
                      <Icons.Filter size={14} className='text-[#6F6D8A]' />
                      <span className='font-semibold text-[#3E3696] text-sm'>
                        Filter
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span
                        className='text-[#366BFF] text-xs cursor-pointer hover:underline'
                        onClick={clearAllFilters}
                      >
                        Clear
                      </span>
                      <Icons.X
                        size={14}
                        className='text-[#6F6D8A] cursor-pointer hover:text-gray-600'
                        onClick={() => setShowFilterPanel(false)}
                      />
                    </div>
                  </div>
                  {/* Filter Content Box */}
                  <div className='bg-[#EAE8FF] rounded-2xl p-2.5'>
                    <div className='text-xs text-[#3E3696] font-semibold mb-2'>
                      Use the Filters below to find a Specific Agent
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Select
                        value={selectedIndustry}
                        onChange={handleIndustryChange}
                        options={industries}
                        popupMatchSelectWidth={false}
                        suffixIcon={<Icons.ChevronDown size={16} className='text-[#6F6D8A]' />}
                        className='w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!text-[#3C3B69]'
                        placeholder='All Industries'
                      />
                      <Select
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        options={departments}
                        popupMatchSelectWidth={false}
                        suffixIcon={<Icons.ChevronDown size={16} className='text-[#6F6D8A]' />}
                        className='w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!text-[#3C3B69]'
                        placeholder='All Departments'
                      />
                      <Select
                        value={selectedFunction}
                        onChange={setSelectedFunction}
                        options={functions}
                        popupMatchSelectWidth={false}
                        suffixIcon={<Icons.ChevronDown size={16} className='text-[#6F6D8A]' />}
                        className='w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!text-[#3C3B69]'
                        placeholder='All Functions'
                      />
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Filter Chips Row */}
        {activeFilters.length > 0 && (
          <div className='flex items-center flex-wrap gap-2 mb-3'>
            <span className='text-[#3C3B69] font-semibold text-sm mr-2'>
              Filter Applied:
            </span>
            {activeFilters.map((filter, idx) => (
              <span
                key={idx}
                className='inline-flex items-center px-2 py-0.5 rounded-md border border-[#DEE4EE] bg-white text-[#26215B] font-normal text-xs'
              >
                {filter.value}
                <button
                  type='button'
                  className='ml-1 text-xs focus:outline-none'
                  onClick={() => removeFilter(filter.type)}
                  aria-label={`Remove ${filter.value}`}
                >
                  <Icons.X
                    size={10}
                    className='text-xs text-[#26215B] hover:text-[#5C53C0]'
                  />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className='flex flex-col mb-3'>
          {/* Tab Section */}
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors relative ${activeTab === 'all'
                ? 'text-[#3E3696]'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              All Agents
              {activeTab === 'all' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#3E3696]' />
              )}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-1.5 pb-3 text-sm font-medium transition-colors relative ${activeTab === 'favorites'
                ? 'text-[#3E3696]'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Favourite Agents
              {activeTab === 'favorites' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#3E3696]' />
              )}
            </button>
          </div>
        </div>


        {/* Cards Grid - ONLY THIS SCROLLS */}
        {allAgentCardsLoading ? (
          <div className='w-full flex items-center justify-center py-10'>
            {/* <Icons.Loader2 className='animate-spin text-gray-400' size={24} />  */}
            <Spin size='small' />
          </div>
        ) : (
          <>
            <div
              ref={cardsContainerRef}
              className={`
            ${showAll ? `
                max-h-[clamp(140px,33vh,328px)] /* responsive height across screen & zoom */
                overflow-y-auto
                overflow-x-hidden
                pr-1
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-thumb]:bg-gray-400
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-track]:rounded-full
              `
                  : `
                max-h-[110px]     
                overflow-hidden
              `
                }

          `}
            >
              <div
                className={`
              ${showAll
                    ? 'grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-2 justify-center pb-2'
                    : 'flex flex-wrap gap-3 justify-center'
                  }
            `}
                role='list'
              >
                {displayedAgents.length === 0 ? (
                  <div className='col-span-full text-gray-400 text-center py-10 text-sm sm:text-base'>
                    No Agents Found
                  </div>
                ) : (
                  displayedAgents.map(agent => {
                    const Icon =
                      (agent.agent_logo && Icons[agent.agent_logo]) || Icons.Bot
                    const isActive = agent.agent_id === currentActiveAgent?.agent_id
                    const is_favorite = optimisticFavorites[agent.agent_id] ?? agent.is_favorite
                    const mainFunction = extractMainFunction(agent);

                    return (
                      <button
                        key={agent.agent_id}
                        type='button'
                        disabled={agent.is_locked}
                        onClick={() => !agent.is_locked && onTopicClick(agent)}
                        className={`
                      relative mt-1 p-0.5 rounded-2xl transition
                      flex items-center justify-center text-left group
                      w-[192px] min-w-[192px] h-[100px] overflow-hidden border
                      ${isActive
                            ? 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400'
                            : agent.is_locked
                              ? 'bg-gray-200 opacity-60 cursor-not-allowed'
                              : 'bg-gray-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                          }
                    `}
                        aria-pressed={isActive}
                        aria-label={`Open ${agent.agent_name}`}
                        role='listitem'
                        style={{ padding: 0 }}
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
                                {agent.is_locked ? (
                                  <Icons.Lock size={16} className='text-gray-500 shrink-0' />
                                ) : (
                                  <button
                                    type='button'
                                    aria-label={is_favorite ? "Unfavorite agent" : "Favorite agent"}
                                    className="bg-none border-none p-0 m-0 cursor-pointer"
                                    onClick={e => {
                                      e.stopPropagation();
                                      onFavoriteClick(agent);
                                    }}
                                  >
                                    {is_favorite ? (
                                      <Icons.Heart fill='#C21020' color='#C21020' size={16} className='text-gray-500 shrink-0 ' />
                                    ) : (
                                      <Icons.Heart size={16} className='text-gray-500 shrink-0' />
                                    )}
                                  </button>
                                )}
                              </span>
                            </div>
                            <div className='flex items-center gap-1  min-w-0'>
                              <span className='flex items-center gap-1.5 min-w-0'>
                                <Icon className='w-5 h-5 text-[#5C53C0] flex-shrink-0' />
                                <div
                                  className='text-sm  font-medium text-[#3E3696] leading-none max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer min-w-0 align-middle'
                                  title={agent.agent_name}
                                  style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    minWidth: 0
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
                                WebkitBoxOrient: 'vertical'
                              }}
                              title={agent.tagline || agent.agent_description || 'No Description'}
                            >
                              {agent.tagline || agent.agent_description || 'No Description'}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}


      </div>

      {/* Agent count and view all/view less toggle - OUTSIDE MAIN CONTAINER */}
      <div className='w-full max-w-[1200px] flex items-center gap-2 text-sm mt-3 min-h-[24px] flex-shrink-0'>
        <span className='text-[#717196] whitespace-nowrap'>
          {displayedAgents.length} of {filteredAgentsNoShared.length} Agents
        </span>
        {displayedAgents.length > maxPreviewCount && (
          <span
            onClick={() => {
              if (showAll && cardsContainerRef.current) {
                setTimeout(() => {
                  cardsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
                }, 0)
              }
              setShowAll(prev => !prev)
            }}
            className='text-[#366BFF] font-semibold cursor-pointer hover:underline whitespace-nowrap'
          >
            {showAll ? 'View Less' : 'View All'}
          </span>
        )}
      </div>
    </div>
  )
}
