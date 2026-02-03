import { useState, useRef, useEffect } from 'react'
import './App.css'
import proteinPowderImage from './assets/shopping.webp'
import shoeImage from './assets/snikker_.jpg'
import iphoneImage from './assets/iphone.webp'

function App() {
  const [noMessageIndex, setNoMessageIndex] = useState(0)
  const [yesClicked, setYesClicked] = useState(false)
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })
  const [hasEverMoved, setHasEverMoved] = useState(false) // Track if button has ever moved
  const [rotatingGifts, setRotatingGifts] = useState<{[key: string]: boolean}>({})
  const [showSapneDekh, setShowSapneDekh] = useState<{[key: string]: boolean}>({})
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const hasMovedRef = useRef(false) // Track if button has moved in current hover
  const lastMoveTimeRef = useRef(0) // Track last move time to prevent rapid triggers
  const giftTimersRef = useRef<{[key: string]: number}>({})
  const positionIndexRef = useRef(0) // Track current position in cycle

  const funnyMessages = [
    "Are you sure?",
    "How dare you!",
    "Think again!",
    "Really? 😢",
    "You're breaking my heart!",
    "Please reconsider!",
    "Don't do this!",
    "I'll be sad!",
    "Try again!",
    "Nope, not allowed!",
    "You can't escape!",
    "Come on now!",
    "Pretty please?",
    "One more chance?",
    "I'm not giving up!"
  ]

  // Calculate safe positions using percentage-based approach for reliability
  const getSafePositions = (buttonWidth: number, buttonHeight: number) => {
    // Use percentage-based positions that are guaranteed to work
    // These percentages ensure button stays well within viewport
    const positions = [
      // Top row - using 10% and 90% to stay well away from edges
      { xPercent: 0.10, yPercent: 0.10, messageIndex: 0 }, // Top-left
      { xPercent: 0.50, yPercent: 0.10, messageIndex: 1 }, // Top-center
      { xPercent: 0.90, yPercent: 0.10, messageIndex: 2 }, // Top-right
      
      // Middle row
      { xPercent: 0.10, yPercent: 0.50, messageIndex: 3 }, // Middle-left
      { xPercent: 0.50, yPercent: 0.50, messageIndex: 4 }, // Center
      { xPercent: 0.90, yPercent: 0.50, messageIndex: 5 }, // Middle-right
      
      // Bottom row
      { xPercent: 0.10, yPercent: 0.90, messageIndex: 6 }, // Bottom-left
      { xPercent: 0.50, yPercent: 0.90, messageIndex: 7 }, // Bottom-center
      { xPercent: 0.90, yPercent: 0.90, messageIndex: 8 }, // Bottom-right
      
      // Additional positions
      { xPercent: 0.25, yPercent: 0.25, messageIndex: 9 },
      { xPercent: 0.75, yPercent: 0.25, messageIndex: 10 },
      { xPercent: 0.25, yPercent: 0.75, messageIndex: 11 },
      { xPercent: 0.75, yPercent: 0.75, messageIndex: 12 },
    ]
    
    // Convert percentages to pixel positions, accounting for button size
    return positions.map(pos => {
      // Calculate position from percentage, then subtract half button size to center it
      let x = (window.innerWidth * pos.xPercent) - (buttonWidth / 2)
      let y = (window.innerHeight * pos.yPercent) - (buttonHeight / 2)
      
      // Ensure button fits completely within viewport
      const margin = 20
      x = Math.max(margin, Math.min(window.innerWidth - buttonWidth - margin, x))
      y = Math.max(margin, Math.min(window.innerHeight - buttonHeight - margin, y))
      
      // Final validation
      if (x + buttonWidth > window.innerWidth - margin) {
        x = window.innerWidth - buttonWidth - margin
      }
      if (y + buttonHeight > window.innerHeight - margin) {
        y = window.innerHeight - buttonHeight - margin
      }
      if (x < margin) x = margin
      if (y < margin) y = margin
      
      return {
        x: Math.max(0, Math.min(window.innerWidth - buttonWidth, x)),
        y: Math.max(0, Math.min(window.innerHeight - buttonHeight, y)),
        messageIndex: pos.messageIndex % funnyMessages.length
      }
    })
  }

  const handleNoClickAttempt = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only move on actual click attempt - prevent if already moved
    e.preventDefault()
    e.stopPropagation()
    const now = Date.now()
    if (!hasMovedRef.current && (now - lastMoveTimeRef.current > 500)) {
      lastMoveTimeRef.current = now
      moveNoButtonAway(e)
    }
  }

  const handleNoHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only move on first hover attempt - prevent rapid triggers
    const now = Date.now()
    if (!hasMovedRef.current && (now - lastMoveTimeRef.current > 500)) {
      lastMoveTimeRef.current = now
      moveNoButtonAway(e)
    }
  }

  const moveNoButtonAway = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    
    // Get computed styles to account for all CSS properties
    const computedStyle = window.getComputedStyle(button)
    const rect = button.getBoundingClientRect()
    
    // Get dimensions - offsetWidth/Height includes padding and border
    const offsetWidth = button.offsetWidth || 0
    const offsetHeight = button.offsetHeight || 0
    
    // Also get from getBoundingClientRect (includes transforms if any)
    const rectWidth = rect.width || 0
    const rectHeight = rect.height || 0
    
    // Get padding and border from computed styles
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0
    
    // Calculate total dimensions including all spacing
    const totalWidth = Math.max(
      offsetWidth,
      rectWidth,
      offsetWidth + paddingLeft + paddingRight + borderLeft + borderRight,
      150 // Minimum safe width
    )
    const totalHeight = Math.max(
      offsetHeight,
      rectHeight,
      offsetHeight + paddingTop + paddingBottom + borderTop + borderBottom,
      60 // Minimum safe height
    )
    
    // Get safe positions (game-like pattern)
    const safePositions = getSafePositions(totalWidth, totalHeight)
    
    if (safePositions.length === 0) {
      // Fallback if no safe positions
      return
    }
    
    // Cycle through positions
    const currentPosition = safePositions[positionIndexRef.current % safePositions.length]
    
    // Move to next position for next click
    positionIndexRef.current = (positionIndexRef.current + 1) % safePositions.length
    
    // Final validation before setting position - triple check
    let finalX = currentPosition.x
    let finalY = currentPosition.y
    
    // Ensure within viewport with extra safety margin
    const safetyMargin = 10
    finalX = Math.max(safetyMargin, Math.min(window.innerWidth - totalWidth - safetyMargin, finalX))
    finalY = Math.max(safetyMargin, Math.min(window.innerHeight - totalHeight - safetyMargin, finalY))
    
    // Verify button fits completely - one more check
    if (finalX + totalWidth > window.innerWidth - safetyMargin) {
      finalX = Math.max(safetyMargin, window.innerWidth - totalWidth - safetyMargin)
    }
    if (finalY + totalHeight > window.innerHeight - safetyMargin) {
      finalY = Math.max(safetyMargin, window.innerHeight - totalHeight - safetyMargin)
    }
    if (finalX < safetyMargin) finalX = safetyMargin
    if (finalY < safetyMargin) finalY = safetyMargin
    
    // Set position and corresponding message
    setNoPosition({ x: finalX, y: finalY })
    setNoMessageIndex(currentPosition.messageIndex)
    
    // Mark as moved
    hasMovedRef.current = true
    setHasEverMoved(true)
  }

  const handleNoLeave = () => {
    // Reset when user leaves so button can move again on next click attempt
    // Only reset if button was actually moved
    if (hasMovedRef.current) {
      setTimeout(() => {
        hasMovedRef.current = false
        lastMoveTimeRef.current = 0
      }, 300)
    }
  }

  // Reset position index when user clicks Yes
  useEffect(() => {
    if (yesClicked) {
      positionIndexRef.current = 0
    }
  }, [yesClicked])

  const handleGiftHover = (giftId: string) => {
    // Start rotation
    setRotatingGifts(prev => ({ ...prev, [giftId]: true }))
    
    // Clear existing timer if any
    if (giftTimersRef.current[giftId]) {
      clearTimeout(giftTimersRef.current[giftId])
    }
    
    // Show "sapne dekh" after 2 seconds
    giftTimersRef.current[giftId] = setTimeout(() => {
      setShowSapneDekh(prev => ({ ...prev, [giftId]: true }))
    }, 2000)
  }

  const handleGiftLeave = (giftId: string) => {
    // Stop rotation
    setRotatingGifts(prev => ({ ...prev, [giftId]: false }))
    setShowSapneDekh(prev => ({ ...prev, [giftId]: false }))
    
    // Clear timer
    if (giftTimersRef.current[giftId]) {
      clearTimeout(giftTimersRef.current[giftId])
      delete giftTimersRef.current[giftId]
    }
  }

  const handleYesClick = () => {
    setYesClicked(true)
  }

  if (yesClicked) {
    return (
      <div className="app success-screen">
        <div className="hearts-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="floating-heart" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}>💖</div>
          ))}
        </div>
        
        {/* SVG Hearts for success screen */}
        <div className="success-svg-hearts">
          {[...Array(25)].map((_, i) => (
            <svg
              key={i}
              className="success-svg-heart"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                width: `${40 + Math.random() * 60}px`,
                height: `${40 + Math.random() * 60}px`
              }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="rgba(255, 105, 180, 0.4)"
                stroke="rgba(255, 20, 147, 0.6)"
                strokeWidth="1"
              />
            </svg>
          ))}
        </div>

        {/* Confetti effect */}
        <div className="confetti">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#ffffff'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="success-content">
          <h1 className="success-title">Yay! 💕</h1>
          
          
          <div className="gifts-container">
            <h2 className="gifts-title">Ye lo cutiee! 💝</h2>
            <div className="gifts-grid">
              <div className="gift-item">
                <div 
                  className={`gift-image-placeholder protein-powder ${rotatingGifts.protein ? 'rotating' : ''}`}
                  onMouseEnter={() => handleGiftHover('protein')}
                  onMouseLeave={() => handleGiftLeave('protein')}
                  onClick={() => handleGiftHover('protein')}
                >
                  <img src={proteinPowderImage} alt="Protein Powder" />
                  {showSapneDekh.protein && (
                    <div className="sapne-dekh-prompt">Sapne dekh 😴</div>
                  )}
                </div>
              </div>
              <div className="gift-item">
                <div 
                  className={`gift-image-placeholder shoe ${rotatingGifts.shoe ? 'rotating' : ''}`}
                  onMouseEnter={() => handleGiftHover('shoe')}
                  onMouseLeave={() => handleGiftLeave('shoe')}
                  onClick={() => handleGiftHover('shoe')}
                >
                  <img src={shoeImage} alt="Shoe" />
                  {showSapneDekh.shoe && (
                    <div className="sapne-dekh-prompt">Sapne dekh 😴</div>
                  )}
                </div>
              </div>
              <div className="gift-item">
                <div 
                  className={`gift-image-placeholder iphone ${rotatingGifts.iphone ? 'rotating' : ''}`}
                  onMouseEnter={() => handleGiftHover('iphone')}
                  onMouseLeave={() => handleGiftLeave('iphone')}
                  onClick={() => handleGiftHover('iphone')}
                >
                  <img src={iphoneImage} alt="iPhone" />
                  {showSapneDekh.iphone && (
                    <div className="sapne-dekh-prompt">Sapne dekh 😴</div>
                  )}
                </div>
              </div>
            </div>
            <p className="gifts-note">💖 Your special gifts! 💖</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="hearts-background">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="heart-bg" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${20 + Math.random() * 30}px`
            }}
          >
            💕
          </div>
        ))}
      </div>

      {/* SVG Heart Graphics */}
      <div className="svg-hearts">
        {[...Array(15)].map((_, i) => (
          <svg
            key={i}
            className="svg-heart"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              width: `${30 + Math.random() * 40}px`,
              height: `${30 + Math.random() * 40}px`
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="rgba(255, 105, 180, 0.3)"
              stroke="rgba(255, 105, 180, 0.5)"
              strokeWidth="0.5"
            />
          </svg>
        ))}
      </div>

      {/* Sparkles */}
      <div className="sparkles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>
      
      <div className="content">
        <div className="question-wrapper">
          <div className="decorative-hearts-left">💖</div>
          <h1 className="question">Will you be my Valentine? 💝</h1>
          <div className="decorative-hearts-right">💖</div>
        </div>
        
        <div className="buttons-container">
          <div className="yes-button-wrapper">
            {/* Sparkles around Yes button */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="button-sparkle yes-sparkle"
                style={{
                  '--angle': `${(i * 45)}deg`,
                  animationDelay: `${i * 0.1}s`
                } as React.CSSProperties}
              >
                ✨
              </div>
            ))}
            <button 
              className="yes-button"
              onClick={handleYesClick}
            >
              <svg className="button-heart" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Yes! 💖
            </button>
          </div>
          
          <div className="no-button-wrapper">
            <button
              ref={noButtonRef}
              className={`no-button ${hasEverMoved ? 'no-button-moving' : ''}`}
              onMouseEnter={handleNoHover}
              onMouseLeave={handleNoLeave}
              onClick={handleNoClickAttempt}
              style={{
                position: hasEverMoved ? 'fixed' : 'relative',
                left: hasEverMoved ? `${noPosition.x}px` : 'auto',
                top: hasEverMoved ? `${noPosition.y}px` : 'auto',
                zIndex: hasEverMoved ? 1000 : 50,
                visibility: 'visible',
                opacity: 1
              }}
            >
              No 😢
            </button>
            {hasEverMoved && (
              <div 
                className="no-message"
                style={{
                  position: 'fixed',
                  left: `${noPosition.x + 60}px`,
                  top: `${Math.max(20, noPosition.y - 80)}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 1001,
                  pointerEvents: 'none'
                }}
              >
                {funnyMessages[noMessageIndex]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
