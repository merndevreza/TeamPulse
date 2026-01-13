"use client";
import React, { useRef, useState, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import loopAnimationData from '@/public/59LEJ___Lexaeon___dot_tool_loop_v2___TAM___2025-10-22.json';

interface LottieLoopButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  'data-testid'?: string;
}

export const LottieLoopButton: React.FC<LottieLoopButtonProps> = ({
  onClick,
  style,
  className,
  'data-testid': dataTestId,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Set to frame 1 on mount
  useEffect(() => {
    if (lottieRef.current && !isAnimating) {
      lottieRef.current.goToAndStop(1, true);
    }
  }, [isAnimating]);

  const handleMouseEnter = () => {
    if (lottieRef.current && !isAnimating) {
      setIsAnimating(true);
      lottieRef.current.stop();
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (lottieRef.current && isAnimating) {
      lottieRef.current.stop();
      lottieRef.current.goToAndStop(1, true);
      setIsAnimating(false);
    }
  };

  const handleAnimationComplete = () => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(1, true);
      setIsAnimating(false);
    }
  };

  return (
    <button
      data-testid={dataTestId}
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ position: 'relative', width: '19px', height: '20px' }}>
        <Lottie
          lottieRef={lottieRef}
          animationData={loopAnimationData}
          loop={false}
          autoplay={false}
          style={{
            width: '16px',
            height: '20px',
            margin: '0 auto',
          }}
          onComplete={handleAnimationComplete}
        />
      </div>
    </button>
  );
};

export default LottieLoopButton;