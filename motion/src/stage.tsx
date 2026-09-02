import React, { createContext, useContext } from 'react'
import { useVideoConfig } from 'remotion'

type Stage = { width: number; height: number }

const StageContext = createContext<Stage | null>(null)

/**
 * Scenes are authored against a 16:9 stage. The social crops (1:1, 9:16) render
 * that same stage scaled inside a taller canvas, so every scene reads its
 * dimensions from here instead of straight from the composition.
 */
export const StageProvider: React.FC<{ value: Stage; children: React.ReactNode }> = ({ value, children }) => (
  <StageContext.Provider value={value}>{children}</StageContext.Provider>
)

export const useStage = (): Stage => {
  const ctx = useContext(StageContext)
  const config = useVideoConfig()
  return ctx ?? { width: config.width, height: config.height }
}
