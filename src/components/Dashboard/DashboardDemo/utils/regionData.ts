import { Region } from '../types/regions';
import { getTimeMultiplier } from './timeAdjustments';

type TimePeriod = 'month' | 'quarter' | 'year';

const TOTAL_REGIONS = 32;

// Helper function to determine region group from region code
const getRegionGroup = (code: string): string => {
  const amerCodes = ['IAD', 'PDX', 'CMH', 'SFO', 'PHX', 'GRU', 'QRO', 'SCL', 'YUL', 'YYC', 'ATL', 'JAN', 'SBN', 'PHL', 'MSP'];
  const emeaCodes = ['ARN', 'BAH', 'CDG', 'CPT', 'DUB', 'DXB', 'FRA', 'LHR', 'MXP', 'TLV', 'ZAZ', 'ZRH'];
  const apjcCodes = ['NRT', 'KIX', 'CGK', 'SIN', 'BKK', 'KUL', 'BJS', 'ZHY', 'HKG', 'TPE', 'AKL', 'MEL', 'SYD', 'ICN', 'BOM', 'HYD'];

  if (amerCodes.includes(code)) return 'AMER';
  if (emeaCodes.includes(code)) return 'EMEA';
  if (apjcCodes.includes(code)) return 'APJC';
  return 'Unknown';
};

export const calculateRegionalMetrics = (selectedRegions: Set<string>, timePeriod: TimePeriod = 'year') => {
  const timeMultiplier = getTimeMultiplier(timePeriod);
  const regionMultiplier = selectedRegions.size / TOTAL_REGIONS;

  // Group selected regions by their main region
  const regionGroups = new Map<string, string[]>();
  selectedRegions.forEach(code => {
    const group = getRegionGroup(code);
    if (group !== 'Unknown') { // Only process known regions
      if (!regionGroups.has(group)) {
        regionGroups.set(group, []);
      }
      regionGroups.get(group)?.push(code);
    }
  });

  // Base metrics for each region (yearly totals)
  const baseMetrics = {
    AMER: {
      totalInvestment: 5200000,
      beneficiaries: 78000,
      volunteerHours: 23000,
      projects: 120,
      programDistribution: {
        STEAM: 1500000,
        Skills: 1000000,
        Sustainability: 1800000,
        Hyperlocal: 900000,
      },
      impactMetrics: {
        "Students Reached": 8000,
        "Employment Created": 600,
        "Trees Planted": 8000,
        "Water Saved (Gal)": 1500000,
        "Communities Impacted": 120,
        "Volunteer Events": 450,
        "Media Coverage": 140,
        "Partner Engagement": 80,
      },
    },
    EMEA: {
      totalInvestment: 3100000,
      beneficiaries: 45000,
      volunteerHours: 15000,
      projects: 80,
      programDistribution: {
        STEAM: 700000,
        Skills: 500000,
        Sustainability: 1200000,
        Hyperlocal: 700000,
      },
      impactMetrics: {
        "Students Reached": 3000,
        "Employment Created": 280,
        "Trees Planted": 3000,
        "Water Saved (Gal)": 600000,
        "Communities Impacted": 80,
        "Volunteer Events": 290,
        "Media Coverage": 60,
        "Partner Engagement": 45,
      },
    },
    APJC: {
      totalInvestment: 1800000,
      beneficiaries: 33789,
      volunteerHours: 7678,
      projects: 34,
      programDistribution: {
        STEAM: 300000,
        Skills: 300000,
        Sustainability: 200000,
        Hyperlocal: 100000,
      },
      impactMetrics: {
        "Students Reached": 1345,
        "Employment Created": 143,
        "Trees Planted": 1345,
        "Water Saved (Gal)": 200000,
        "Communities Impacted": 34,
        "Volunteer Events": 150,
        "Media Coverage": 30,
        "Partner Engagement": 31,
      },
    },
  };

  // If no valid regions are selected, return empty array
  if (regionGroups.size === 0) {
    return [];
  }

  return Array.from(regionGroups.entries()).map(([region, codes]) => {
    const base = baseMetrics[region as keyof typeof baseMetrics];
    const ratio = (codes.length / TOTAL_REGIONS) * timeMultiplier;

    return {
      region,
      metrics: {
        totalInvestment: base.totalInvestment * ratio,
        beneficiaries: Math.round(base.beneficiaries * ratio),
        volunteerHours: Math.round(base.volunteerHours * ratio),
        projects: Math.round(base.projects * ratio),
      },
      programDistribution: Object.entries(base.programDistribution).map(([name, value]) => ({
        name,
        value: value * ratio,
      })),
      impactMetrics: Object.entries(base.impactMetrics).map(([name, value]) => ({
        name,
        value: Math.round(value * ratio),
      })),
    };
  });
};