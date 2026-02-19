'use client';

import { useEffect } from "react";

export default function Snackbar({ msg, onUndo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="snackbar">
      <span>{msg}</span>
      {onUndo && <span className="snackbar-undo" onClick={onUndo}>UNDO</span>}
    </div>
  );
}
