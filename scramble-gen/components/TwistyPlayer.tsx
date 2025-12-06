'use client'

import { useEffect, useRef } from 'react'
import { TwistyPlayer } from 'cubing/twisty'

interface TwistyPlayerComponentProps {
  alg: string
  visualization?: string
  hintFacelets?: string
  backView?: string
  background?: string
  controlPanel?: string
  puzzle?: string
  className?: string
}

export default function TwistyPlayerComponent({
  alg,
  visualization = '2D',
  hintFacelets = 'none',
  backView = 'none',
  background = 'none',
  controlPanel = 'none',
  puzzle = '3x3x3',
  className = '',
}: TwistyPlayerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<TwistyPlayer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create a new TwistyPlayer instance
    const player = new TwistyPlayer({
      puzzle: puzzle as any,
      alg,
      visualization: visualization as any,
      hintFacelets: hintFacelets as any,
      backView: backView as any,
      background: background as any,
      controlPanel: controlPanel as any,
    })

    // Clear container and append player
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(player)
    playerRef.current = player

    // Cleanup
    return () => {
      if (containerRef.current && playerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [puzzle, visualization, hintFacelets, backView, background, controlPanel])

  // Update alg when it changes
  useEffect(() => {
    if (playerRef.current && alg) {
      playerRef.current.alg = alg
    }
  }, [alg])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
    />
  )
}

