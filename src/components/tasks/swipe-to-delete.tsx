"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Trash2 } from "lucide-react";

const ACTION_WIDTH = 76;
// Порог, после которого решаем, что это горизонтальный свайп, а не скролл списка.
const DIRECTION_THRESHOLD = 8;

interface SwipeToDeleteProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  label: string;
  /** Заголовок категории живёт вне `<ul>`, поэтому обёртке нужен `div`, а не `li`. */
  as?: "li" | "div";
}

/**
 * Обёртка строки списка: тянем влево — из-под карточки выезжает кнопка удаления.
 * Вертикальный скролл отдаём браузеру (touch-action: pan-y), горизонтальный ведём сами.
 */
export function SwipeToDelete({
  children,
  open,
  onOpenChange,
  onDelete,
  label,
  as: Wrapper = "li",
}: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ startX: number; startY: number; startOffset: number; axis: "x" | "y" | null } | null>(null);
  const movedRef = useRef(false);

  useEffect(() => {
    if (gesture.current) return;
    setOffset(open ? -ACTION_WIDTH : 0);
  }, [open]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = { startX: event.clientX, startY: event.clientY, startOffset: offset, axis: null };
    movedRef.current = false;
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = gesture.current;
    if (!state) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (state.axis === null) {
      if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      state.axis = "x";
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    movedRef.current = true;
    setOffset(Math.min(0, Math.max(-ACTION_WIDTH, state.startOffset + dx)));
  }

  function finishGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const state = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!state || state.axis !== "x") return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const shouldOpen = offset < -ACTION_WIDTH / 2;
    setOffset(shouldOpen ? -ACTION_WIDTH : 0);
    onOpenChange(shouldOpen);
  }

  // Свайп не должен «проваливаться» кликом в чекбокс/звезду под пальцем,
  // а тап по открытой строке просто возвращает её на место.
  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (movedRef.current || open) {
      event.preventDefault();
      event.stopPropagation();
      movedRef.current = false;
      if (open) onOpenChange(false);
    }
  }

  return (
    <Wrapper className="relative overflow-hidden rounded-xl">
      {offset !== 0 && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={label}
          className="absolute inset-y-0 right-0 flex w-[76px] items-center justify-center rounded-xl bg-ink-red/15 text-ink-red transition-colors active:bg-ink-red/25"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onClickCapture={handleClickCapture}
        style={{ transform: `translateX(${offset}px)` }}
        className={`relative touch-pan-y ${dragging ? "" : "transition-transform duration-200"}`}
      >
        {children}
      </div>
    </Wrapper>
  );
}
