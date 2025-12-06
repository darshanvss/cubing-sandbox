'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { randomScrambleForEvent } from 'cubing/scramble'
import TwistyPlayerComponent from '@/components/TwistyPlayer'

export default function Home() {
  const [scramble, setScramble] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const generateScramble = async () => {
    setIsLoading(true)
    try {
      const scrambleAlg = await randomScrambleForEvent('333')
      const scrambleString = scrambleAlg.toString()
      setScramble(scrambleString)
    } catch (error) {
      console.error('Error generating scramble:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScrambleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScramble = e.target.value
    setScramble(newScramble)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold">3x3 Scramble Generator</h1>
        <Button 
          onClick={generateScramble} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Generating...' : 'Generate Scramble'}
        </Button>
        
        {scramble && (
          <>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label htmlFor="scramble-input" className="text-sm font-medium">
                  Scramble (editable):
                </label>
                <Input
                  id="scramble-input"
                  value={scramble}
                  onChange={handleScrambleChange}
                  className="w-full text-lg font-mono"
                  placeholder="Enter scramble notation..."
                />
              </div>
              
              <div className="w-full flex justify-center p-6 bg-muted rounded-lg border">
                <TwistyPlayerComponent
                  alg={scramble}
                  visualization="2D"
                  hintFacelets="none"
                  backView="none"
                  background="none"
                  controlPanel="none"
                  puzzle="3x3x3"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
