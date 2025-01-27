import { SelectOption } from '../_components/ComboBox';
import { AppConstants } from './AppConstants';

interface TeamApiResponse {
  name: string;
  id: string;
}

export let TeamsCache: SelectOption[] = [];
export let lastFetchTime = 0;
const CACHE_TIMEOUT = 1000 * 60 * 10; // 10 minutes

export const fetchTeams = async (): Promise<SelectOption[]> => {
  const now = Date.now();
  // Return cache if it exists and hasn't expired
  if (TeamsCache.length > 0 && now - lastFetchTime < CACHE_TIMEOUT) {
    return TeamsCache;
  }

  // Only fetch if we're past the timeout
  if (now - lastFetchTime >= CACHE_TIMEOUT) {
    try {
      const res = await fetch(
        `${AppConstants.AI_HORDE_PROD_URL}/api/v2/teams`,
        {
          cache: 'no-store'
        }
      );
      const details = (await res.json()) as TeamApiResponse[];

      if (Array.isArray(details)) {
        const formatTeams: SelectOption[] = details.map((team) => {
          return {
            label: team.name,
            value: team.id
          };
        });

        formatTeams.sort((a, b) => {
          // Sort by online status first (true values first)
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });

        formatTeams.unshift({
          label: 'None',
          // @ts-expect-error null is okay here
          value: null
        });

        // Only update cache and timestamp on successful fetch and processing
        TeamsCache = formatTeams;
        lastFetchTime = now;

        return formatTeams;
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }

  // If we couldn't fetch new data and cache exists, return cache even if expired
  if (TeamsCache.length > 0) {
    return TeamsCache;
  }

  // Return empty array as fallback if no data available
  return [] as SelectOption[];
};
