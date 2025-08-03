import { createDashboard, DashboardConfig } from '../GenericDashboard';

// Import all data sources
import breakfastData from '../../data/breakfastDataByYear.json';
import coffeeData from '../../data/coffeeDataByYear.json';
import dabsData from '../../data/dabsDataByYear.json';
import drankData from '../../data/drankDataByYear.json';
import greenTeaData from '../../data/greenTeaDataByYear.json';
import morningWalkData from '../../data/morningWalkDataByYear.json';
import netflixData from '../../data/netflixDataByYear.json';
import pagesReadData from '../../data/pagesReadByYear.json';
import phoneInMorningData from '../../data/phoneInMorningDataByYear.json';
import relaxData from '../../data/relaxDataByYear.json';
import smokeData from '../../data/smokeDataByYear.json';
import brushedTeethData from '../../data/brushedTeethDataByYear.json';
import washedFaceData from '../../data/washedFaceDataByYear.json';
import waterBottlesData from '../../data/waterBottlesDataByYear.json';
import weightData from '../../data/weightDataByYear.json';

// Dashboard configurations
export const dashboardConfigs: Record<string, DashboardConfig> = {
  breakfast: {
    title: 'Breakfast',
    dataSource: breakfastData,
    color: '#FFA500',
    icon: '🍳',
    unit: 'days',
    description: 'Days with breakfast consumed'
  },
  
  coffee: {
    title: 'Coffee',
    dataSource: coffeeData,
    color: '#8B4513',
    icon: '☕',
    unit: 'days',
    description: 'Days with coffee consumed'
  },
  
  dabs: {
    title: 'Dabs',
    dataSource: dabsData,
    color: '#9B59B6',
    icon: '💨',
    unit: 'times',
    description: 'Total dab sessions'
  },
  
  drinks: {
    title: 'Drinks',
    dataSource: drankData,
    color: '#E74C3C',
    icon: '🍺',
    unit: 'drinks',
    description: 'Alcoholic beverages consumed'
  },
  
  greenTea: {
    title: 'Green Tea',
    dataSource: greenTeaData,
    color: '#27AE60',
    icon: '🍵',
    unit: 'days',
    description: 'Days with green tea consumed'
  },
  
  morningWalk: {
    title: 'Morning Walk',
    dataSource: morningWalkData,
    color: '#3498DB',
    icon: '🚶‍♂️',
    unit: 'walks',
    description: 'Morning walks completed'
  },
  
  netflix: {
    title: 'Netflix in Bed',
    dataSource: netflixData,
    color: '#E50914',
    icon: '📺',
    unit: 'nights',
    description: 'Nights watching Netflix in bed'
  },
  
  pagesRead: {
    title: 'Pages Read',
    dataSource: pagesReadData,
    color: '#F39C12',
    icon: '📚',
    unit: 'pages',
    description: 'Total pages read'
  },
  
  phoneInMorning: {
    title: 'Phone in Morning',
    dataSource: phoneInMorningData,
    color: '#E67E22',
    icon: '📱',
    unit: 'days',
    description: 'Days using phone within 30min of waking'
  },
  
  relax: {
    title: 'Relaxation',
    dataSource: relaxData,
    color: '#1ABC9C',
    icon: '🧘‍♂️',
    unit: 'days',
    description: 'Days with relaxation activities'
  },
  
  smoke: {
    title: 'Smoking',
    dataSource: smokeData,
    color: '#95A5A6',
    icon: '🚬',
    unit: 'days',
    description: 'Days with smoking'
  },
  
  brushedTeeth: {
    title: 'Brushed Teeth',
    dataSource: brushedTeethData,
    color: '#3498DB',
    icon: '🦷',
    unit: 'days',
    description: 'Days with teeth brushed'
  },
  
  washedFace: {
    title: 'Washed Face',
    dataSource: washedFaceData,
    color: '#85C1E9',
    icon: '🧴',
    unit: 'days',
    description: 'Days with face washed'
  },
  
  waterBottles: {
    title: 'Water Bottles',
    dataSource: waterBottlesData,
    color: '#5DADE2',
    icon: '💧',
    unit: 'bottles',
    description: 'Water bottles consumed'
  },
  
  weight: {
    title: 'Weight',
    dataSource: weightData,
    color: '#8E44AD',
    icon: '⚖️',
    unit: 'lbs',
    description: 'Body weight tracking'
  }
};

// Create dashboard components
export const BreakfastDashboard = createDashboard(dashboardConfigs.breakfast);
export const CoffeeDashboard = createDashboard(dashboardConfigs.coffee);
export const DabsDashboard = createDashboard(dashboardConfigs.dabs);
export const DrinkDashboard = createDashboard(dashboardConfigs.drinks);
export const GreenTeaDashboard = createDashboard(dashboardConfigs.greenTea);
export const MorningWalkDashboard = createDashboard(dashboardConfigs.morningWalk);
export const NetflixInBedDashboard = createDashboard(dashboardConfigs.netflix);
export const PagesReadDashboard = createDashboard(dashboardConfigs.pagesRead);
export const PhoneInMorningDashboard = createDashboard(dashboardConfigs.phoneInMorning);
export const RelaxDashboard = createDashboard(dashboardConfigs.relax);
export const SmokeDashboard = createDashboard(dashboardConfigs.smoke);
export const BrushTeethDashboard = createDashboard(dashboardConfigs.brushedTeeth);
export const WashFaceDashboard = createDashboard(dashboardConfigs.washedFace);
export const WaterBottlesDashboard = createDashboard(dashboardConfigs.waterBottles);
export const WeightDashboard = createDashboard(dashboardConfigs.weight);

// Export all dashboards as a map for dynamic usage
export const allDashboards = {
  BreakfastDashboard,
  CoffeeDashboard, 
  DabsDashboard,
  DrinkDashboard,
  GreenTeaDashboard,
  MorningWalkDashboard,
  NetflixInBedDashboard,
  PagesReadDashboard,
  PhoneInMorningDashboard,
  RelaxDashboard,
  SmokeDashboard,
  BrushTeethDashboard,
  WashFaceDashboard,
  WaterBottlesDashboard,
  WeightDashboard
};