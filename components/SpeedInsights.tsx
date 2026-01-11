import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * SpeedInsights component wrapper for Vercel Speed Insights integration.
 * This component wraps the SpeedInsights tracking script and injects it into the React app.
 * 
 * Learn more: https://vercel.com/docs/speed-insights
 */
export const SpeedInsightsWrapper: React.FC = () => {
  return <SpeedInsights />;
};

export default SpeedInsightsWrapper;
