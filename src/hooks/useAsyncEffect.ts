import type { DependencyList } from 'react';
import { useEffect } from 'react';

function useAsyncEffect(effect: () => Promise<any>, deps: DependencyList = []) {
  useEffect(() => {
    effect();
    // biome-ignore lint/correctness/useExhaustiveDependencies: This is a wrapper around useEffect
  }, deps);
}

export default useAsyncEffect;
