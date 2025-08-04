// ESM shim for react-reconciler/constants
// React 18.3.1 and react-reconciler 0.29.2 compatibility constants

export const ConcurrentRoot = 1;
export const LegacyRoot = 0;

export const DiscreteEventPriority = 1;
export const ContinuousEventPriority = 4;
export const DefaultEventPriority = 16;
export const IdleEventPriority = 536870912;

// Default export for compatibility
export default {
  ConcurrentRoot,
  LegacyRoot,
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
  IdleEventPriority,
};
