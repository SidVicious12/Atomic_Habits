import { createLazyDashboard } from '../LazyDashboard';

// Lazy-loaded dashboard components
export const LazyBreakfastDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.BreakfastDashboard })),
  'BreakfastDashboard'
);

export const LazyCoffeeDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.CoffeeDashboard })),
  'CoffeeDashboard'
);

export const LazyDabsDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.DabsDashboard })),
  'DabsDashboard'
);

export const LazyDrinkDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.DrinkDashboard })),
  'DrinkDashboard'
);

export const LazyGreenTeaDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.GreenTeaDashboard })),
  'GreenTeaDashboard'
);

export const LazyMorningWalkDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.MorningWalkDashboard })),
  'MorningWalkDashboard'
);

export const LazyNetflixInBedDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.NetflixInBedDashboard })),
  'NetflixInBedDashboard'
);

export const LazyPagesReadDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.PagesReadDashboard })),
  'PagesReadDashboard'
);

export const LazyPhoneInMorningDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.PhoneInMorningDashboard })),
  'PhoneInMorningDashboard'
);

export const LazyRelaxDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.RelaxDashboard })),
  'RelaxDashboard'
);

export const LazySmokeDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.SmokeDashboard })),
  'SmokeDashboard'
);

export const LazyBrushTeethDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.BrushTeethDashboard })),
  'BrushTeethDashboard'
);

export const LazyWashFaceDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.WashFaceDashboard })),
  'WashFaceDashboard'
);

export const LazyWaterBottlesDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.WaterBottlesDashboard })),
  'WaterBottlesDashboard'
);

export const LazyWeightDashboard = createLazyDashboard(
  () => import('./index').then(module => ({ default: module.WeightDashboard })),
  'WeightDashboard'
);

// Lazy pages
export const LazyDailyLogPage = createLazyDashboard(
  () => import('../../pages/DailyLogPage'),
  'DailyLogPage'
);

export const LazyCategoryPage = createLazyDashboard(
  () => import('../../pages/CategoryPage'),
  'CategoryPage'
);

export const LazyHabitDetailPage = createLazyDashboard(
  () => import('../../pages/HabitDetailPage'),
  'HabitDetailPage'
);

// Map for easy access
export const lazyDashboards = {
  BreakfastDashboard: LazyBreakfastDashboard,
  CoffeeDashboard: LazyCoffeeDashboard,
  DabsDashboard: LazyDabsDashboard,
  DrinkDashboard: LazyDrinkDashboard,
  GreenTeaDashboard: LazyGreenTeaDashboard,
  MorningWalkDashboard: LazyMorningWalkDashboard,
  NetflixInBedDashboard: LazyNetflixInBedDashboard,
  PagesReadDashboard: LazyPagesReadDashboard,
  PhoneInMorningDashboard: LazyPhoneInMorningDashboard,
  RelaxDashboard: LazyRelaxDashboard,
  SmokeDashboard: LazySmokeDashboard,
  BrushTeethDashboard: LazyBrushTeethDashboard,
  WashFaceDashboard: LazyWashFaceDashboard,
  WaterBottlesDashboard: LazyWaterBottlesDashboard,
  WeightDashboard: LazyWeightDashboard,
};

export const lazyPages = {
  DailyLogPage: LazyDailyLogPage,
  CategoryPage: LazyCategoryPage,
  HabitDetailPage: LazyHabitDetailPage,
};