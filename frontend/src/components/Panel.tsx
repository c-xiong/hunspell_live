import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useIsMobile } from "../hooks/useIsMobile";

interface PanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Small floating panel below the header on desktop, bottom sheet on mobile.
const Panel: React.FC<PanelProps> = ({ title, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      data-panel
      className={
        isMobile
          ? "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-popup dark:border-slate-700 dark:bg-slate-800"
          : "fixed right-4 top-16 z-50 max-h-[70vh] w-80 overflow-y-auto rounded-card border border-slate-200 bg-white p-4 shadow-popup dark:border-slate-700 dark:bg-slate-800"
      }
      onClick={(e) => e.stopPropagation()}
    >
      {isMobile && (
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
      )}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-base font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <FaTimes />
        </button>
      </div>
      {children}
    </div>
  );
};

export default Panel;
