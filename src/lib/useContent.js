import { useEffect, useState } from 'react';
import { fetchEvents, fetchProjects, fetchReports } from './api';
import { FALLBACK_EVENTS, FALLBACK_PROJECTS, FALLBACK_REPORTS } from './content';

/**
 * Sections start rendering from the bundled content immediately and swap in
 * database rows when they arrive. That ordering matters here: the QR reveal
 * hands off to a page that is supposed to be *already painted*, so nothing
 * below the fold may depend on a network round trip to have laid out.
 */
function useRemote(loader, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let alive = true;
    loader()
      .then((rows) => {
        if (alive && Array.isArray(rows) && rows.length) setData(rows);
      })
      .catch(() => {
        /* api.js already falls back; nothing further to do */
      });
    return () => {
      alive = false;
    };
  }, [loader]);

  return data;
}

export const useProjects = () => useRemote(fetchProjects, FALLBACK_PROJECTS);
export const useEvents = () => useRemote(fetchEvents, FALLBACK_EVENTS);
export const useReports = () => useRemote(fetchReports, FALLBACK_REPORTS);
