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
  const appContainerRef = useRef<HTMLDivElement>(null)
  const hasMovedRef = useRef(false) // Track if button has moved in current hover
  const giftTimersRef = useRef<{[key: string]: number}>({})

  // Get actual viewport dimensions - full screen like normal laptop
  const getViewportDimensions = () => {
    // Use app container dimensions if available
    if (appContainerRef.current) {
      const rect = appContainerRef.current.getBoundingClientRect()
      return { 
        width: Math.max(rect.width, 320), 
        height: Math.max(rect.height, 240) 
      }
    }
    
    // Use full window dimensions for normal laptop screen
    const width = window.innerWidth || document.documentElement.clientWidth || 0
    const height = window.innerHeight || document.documentElement.clientHeight || 0
    
    return { 
      width: Math.max(width, 320), 
      height: Math.max(height, 240) 
    }
  }

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

  // Simple function to get safe random position within viewport
  const getSafeRandomPosition = () => {
    const viewport = getViewportDimensions()
    // Large margins and button size estimates to ensure button stays well inside
    const margin = 200 // Large margin from edges
    const buttonWidth = 250 // Generous estimate
    const buttonHeight = 100 // Generous estimate
    
    // Calculate safe area - ensure it's well within viewport
    const safeWidth = viewport.width - (margin * 2) - buttonWidth
    const safeHeight = viewport.height - (margin * 2) - buttonHeight
    
    // Ensure we have valid bounds
    if (safeWidth <= 0 || safeHeight <= 0) {
      // Fallback to center if viewport is too small
      return {
        x: Math.max(margin, (viewport.width - buttonWidth) / 2),
        y: Math.max(margin, (viewport.height - buttonHeight) / 2),
        messageIndex: Math.floor(Math.random() * funnyMessages.length)
      }
    }
    
    // Generate random position well within safe bounds
    const x = margin + Math.random() * safeWidth
    const y = margin + Math.random() * safeHeight
    
    return {
      x: Math.max(margin, Math.min(viewport.width - buttonWidth - margin, x)),
      y: Math.max(margin, Math.min(viewport.height - buttonHeight - margin, y)),
      messageIndex: Math.floor(Math.random() * funnyMessages.length)
    }
  }

  const handleNoClickAttempt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasMovedRef.current) {
      moveNoButtonAway()
    }
  }

  const handleNoHover = () => {
    if (!hasMovedRef.current) {
      moveNoButtonAway()
    }
  }

  const moveNoButtonAway = () => {
    // Get safe random position - simple and reliable
    const safePos = getSafeRandomPosition()
    
    // Set position and message
    setNoPosition({ x: safePos.x, y: safePos.y })
    setNoMessageIndex(safePos.messageIndex)
    
    // Mark as moved
    hasMovedRef.current = true
    setHasEverMoved(true)
  }

  const handleNoLeave = () => {
    // Reset when user leaves so button can move again on next click attempt
    if (hasMovedRef.current) {
      setTimeout(() => {
        hasMovedRef.current = false
      }, 300)
    }
  }

  // Handle window resize to ensure button stays within viewport
  useEffect(() => {
    const handleResize = () => {
      // If button has moved, clamp its position to new viewport bounds
      if (hasEverMoved) {
        setNoPosition(prevPos => {
          const viewport = getViewportDimensions()
          const margin = 200
          const buttonWidth = 250
          const buttonHeight = 100
          
          // Simple clamp to safe bounds
          const x = Math.max(margin, Math.min(viewport.width - buttonWidth - margin, prevPos.x))
          const y = Math.max(margin, Math.min(viewport.height - buttonHeight - margin, prevPos.y))
          
          return { x, y }
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hasEverMoved])


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
      <div className="app success-screen" ref={appContainerRef}>
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
    <div className="app" ref={appContainerRef}>
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
