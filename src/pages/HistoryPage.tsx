/**
 * HistoryPage - Desktop version of habit history viewing
 * Uses shared HistoryView component for consistency with mobile
 */

import HistoryView from '@/components/HistoryView';

export default function HistoryPage() {
  return <HistoryView variant="desktop" daysToShow={14} />;
}
