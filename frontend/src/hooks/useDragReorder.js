import { useCallback, useRef, useState } from 'react';

/**
 * Generic drag-and-drop reorder helper — built on native Pointer Events
 * (NOT the old HTML5 draggable API), so it works identically with:
 *   - Mouse (click + hold + move + release)
 *   - Trackpad
 *   - Touch screens (tap + hold + swipe up/down/left/right)
 * Works for vertical lists (table rows, cards) AND wrapped horizontal
 * lists (tag/chip rows) — it finds the nearest item to the pointer,
 * whichever direction you drag.
 *
 * Usage:
 *   const { getContainerProps, getItemProps, getHandleProps, isDragging, isOver } =
 *     useDragReorder((from, to) => setItems((prev) => reorderArray(prev, from, to)));
 *
 *   <tbody {...getContainerProps()}>
 *     {items.map((item, index) => (
 *       <tr key={item._id} {...getItemProps(index)} className={...}>
 *         <td><span {...getHandleProps(index)} className="drag-handle">⠿</span></td>
 *         ...
 *       </tr>
 *     ))}
 *   </tbody>
 */
export const useDragReorder = (onReorder) => {
  const containerRef = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragIndexRef = useRef(null);
  const overIndexRef = useRef(null);

  const getContainerProps = () => ({ ref: containerRef });

  const getItemProps = (index) => ({ 'data-dnd-index': index });

  // Finds which item's center point is closest to the pointer — this is
  // what lets the same hook handle up/down (tables, cards) and
  // left/right (wrapped chip rows) dragging.
  const findClosestIndex = (clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return null;
    const items = container.querySelectorAll('[data-dnd-index]');
    let closestIndex = null;
    let closestDist = Infinity;
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = (cx - clientX) ** 2 + (cy - clientY) ** 2;
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = Number(el.getAttribute('data-dnd-index'));
      }
    });
    return closestIndex;
  };

  const handlePointerMove = useCallback((e) => {
    if (dragIndexRef.current === null) return;
    e.preventDefault();
    const point = e.touches?.[0] || e;
    const idx = findClosestIndex(point.clientX, point.clientY);
    if (idx !== null && idx !== overIndexRef.current) {
      overIndexRef.current = idx;
      setOverIndex(idx);
    }
  }, []);

  const endDrag = useCallback(() => {
    const from = dragIndexRef.current;
    const to = overIndexRef.current;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', endDrag);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    dragIndexRef.current = null;
    overIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    if (from !== null && to !== null && from !== to) {
      onReorder(from, to);
    }
  }, [onReorder, handlePointerMove]);

  const getHandleProps = (index) => ({
    onPointerDown: (e) => {
      // Only respond to primary mouse button / single touch.
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      dragIndexRef.current = index;
      overIndexRef.current = index;
      setDragIndex(index);
      setOverIndex(index);
      document.addEventListener('pointermove', handlePointerMove, { passive: false });
      document.addEventListener('pointerup', endDrag);
      document.addEventListener('pointercancel', endDrag);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    },
    style: { touchAction: 'none' },
  });

  return {
    getContainerProps,
    getItemProps,
    getHandleProps,
    isDragging: (index) => dragIndex === index,
    isOver: (index) => overIndex === index && dragIndex !== index,
  };
};

/** Move the item at `fromIndex` to `toIndex`, returning a new array. */
export const reorderArray = (array, fromIndex, toIndex) => {
  const updated = [...array];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
};
