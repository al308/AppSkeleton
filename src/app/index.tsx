import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { TitleScreen } from '../screens/TitleScreen';
import { AnimatedSplash } from '../components/ui/AnimatedSplash';
import { TRAINING_LESSONS } from '../data/training';
import { useReduceMotion } from '../hooks/useReduceMotion';

// Play the launch splash once per app session, not on every return to the title.
let hasPlayedSplash = false;

export default function TitleRoute(): React.ReactElement {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const [showSplash, setShowSplash] = useState(!hasPlayedSplash);

  const finishSplash = (): void => {
    hasPlayedSplash = true;
    setShowSplash(false);
  };

  return (
    <>
      <TitleScreen
        onPlay={() => router.push('/worlds')}
        onSettings={() => router.push('/settings')}
        onTraining={() => router.push(`/training/${TRAINING_LESSONS[0]?.id ?? ''}`)}
      />
      {showSplash ? <AnimatedSplash onFinish={finishSplash} reduceMotion={reduceMotion} /> : null}
    </>
  );
}
