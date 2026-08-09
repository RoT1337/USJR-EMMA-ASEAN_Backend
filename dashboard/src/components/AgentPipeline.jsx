import { useState, useEffect, useRef } from 'react'
import AgentCard from './AgentCard'

const AGENTS = ['intake', 'vulnerability', 'resource', 'routing', 'pattern', 'handoff']
const STAGGER_DELAY = 250 // ms between each card reveal

export default function AgentPipeline({ outputs, isProcessing = false }) {
  // Track the state of each agent: { key, isSkeleton, hasRevealed }
  const [agentStates, setAgentStates] = useState(
    AGENTS.map(key => ({ key, isSkeleton: true, hasRevealed: false }))
  )
  const prevIsProcessing = useRef(isProcessing)
  const prevOutputs = useRef(outputs)

  // Reset when starting a new report
  useEffect(() => {
    if (isProcessing && !prevIsProcessing.current) {
      // Starting new processing - reset all to skeletons
      setAgentStates(AGENTS.map(key => ({ key, isSkeleton: true, hasRevealed: false })))
    }
    prevIsProcessing.current = isProcessing
  }, [isProcessing])

  // When outputs arrive, update which agents are populated
  useEffect(() => {
    if (!outputs || isProcessing) return
    if (outputs === prevOutputs.current) return

    setAgentStates(prev => prev.map(agent => ({
      ...agent,
      isSkeleton: !outputs[agent.key]
    })))
    
    prevOutputs.current = outputs
  }, [outputs, isProcessing])

  // Mark agents as revealed when processing starts.
  // Schedules off the AGENTS constant rather than reading agentStates, so the
  // effect does not need agentStates as a dependency (which would re-run it on
  // every reveal and restack the timers). Timers are now cleared on unmount.
  useEffect(() => {
    if (!isProcessing) return

    const timers = AGENTS.map((key, i) =>
      setTimeout(() => {
        setAgentStates(prev => prev.map(a =>
          a.key === key ? { ...a, hasRevealed: true } : a
        ))
      }, i * STAGGER_DELAY)
    )

    return () => timers.forEach(clearTimeout)
  }, [isProcessing])

  // Reset on new report
  useEffect(() => {
    if (!outputs && !isProcessing && prevOutputs.current) {
      setAgentStates(AGENTS.map(key => ({ key, isSkeleton: true, hasRevealed: false })))
      prevOutputs.current = null
    }
  }, [outputs, isProcessing])

  // Count completed agents
  const completedCount = agentStates.filter(a => !a.isSkeleton && outputs?.[a.key]).length

  return (
    <div className="pipeline">
      <div className="pipeline-header">
        <span className="pipeline-title">Agent Pipeline</span>
        <div className="pipeline-dots">
          {AGENTS.map(key => {
            const hasData = outputs?.[key] !== undefined && outputs?.[key] !== null
            const isActive = isProcessing && !hasData
            return (
              <span
                key={key}
                className={`pipeline-dot ${hasData ? 'complete' : ''} ${isActive ? 'active' : ''}`}
              />
            )
          })}
        </div>
        <span className="pipeline-count">
          {completedCount}/{AGENTS.length}
        </span>
      </div>

      <div className="pipeline-steps">
        {agentStates.map((agent, idx) => {
          const data = outputs?.[agent.key] ?? null
          const isSkeleton = agent.isSkeleton

          // Step number is based on position in AGENTS array
          const stepNumber = idx + 1
          const animationDelay = (idx) * STAGGER_DELAY

          // Only show if revealed or still processing
          if (isProcessing && !agent.hasRevealed) return null

          return (
            <div
              key={agent.key}
              id={`doc-section-${agent.key}`}
              /* Stable class: swapping it when results land restarted the
                 animation and made the whole pipeline jump. */
              className="pipeline-step-animate"
              style={{ animationDelay: `${animationDelay}ms` }}
            >
              <div className="pipeline-step-number">
                Step {stepNumber} of {AGENTS.length}
              </div>
              <AgentCard
                agentKey={agent.key}
                data={isSkeleton ? null : data}
                animationDelay={0}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}