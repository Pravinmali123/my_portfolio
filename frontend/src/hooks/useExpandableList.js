import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic "View More / Show Less" list-expansion hook.
 *
 * Shows only the first `limit` items until the user expands the list, then
 * reveals the rest with a smooth enter animation. Collapsing plays a short
 * reverse (fade-out) animation before the extra items are actually removed,
 * so nothing pops away abruptly.
 *
 * Reused across every admin table/list and every portfolio grid that needs
 * this behaviour, so the expand/collapse logic lives in exactly one place.
 *
 * @param {Array} items - full list of records
 * @param {number} limit - how many records to show initially (default 6)
 * @param {number} exitDuration - ms to wait for the collapse animation before
 *   actually slicing the list back down (should match the CSS animation length)
 */
export const useExpandableList = (items = [], limit = 6, exitDuration = 260) => {
  const [expanded, setExpanded] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const timeoutRef = useRef(null);

  const hasMore = items.length > limit;

  // If the underlying dataset shrinks (e.g. after a delete) to the point
  // it no longer has extra items, make sure we don't get stuck in an
  // "expanded"/"collapsing" state with a stale timeout.
  useEffect(() => {
    if (!hasMore && (expanded || collapsing)) {
      clearTimeout(timeoutRef.current);
      setExpanded(false);
      setCollapsing(false);
    }
  }, [hasMore, expanded, collapsing]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const toggle = useCallback(() => {
    if (expanded) {
      setCollapsing(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setExpanded(false);
        setCollapsing(false);
      }, exitDuration);
    } else {
      setExpanded(true);
    }
  }, [expanded, exitDuration]);

  const showAll = expanded || collapsing;
  const visibleItems = !hasMore || showAll ? items : items.slice(0, limit);

  // className helper for individual rows/cards: only items beyond `limit`
  // (the "extra" ones) get an enter/leave animation class.
  const getItemClassName = useCallback(
    (index) => {
      if (index < limit) return '';
      return collapsing ? 'vm-leave' : 'vm-enter';
    },
    [limit, collapsing]
  );

  return { visibleItems, hasMore, expanded, collapsing, toggle, getItemClassName, limit };
};

export default useExpandableList;