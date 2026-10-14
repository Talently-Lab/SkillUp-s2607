import { useEffect } from "react";

import "./Notice.css";

export type NoticeContent = {
  message: string;
  action?: { label: string; onClick: () => void };
};

const NOTICE_MS = 5000;

type NoticeProps = {
  notice: NoticeContent | null;
  onDismiss: () => void;
};

export function Notice({ notice, onDismiss }: NoticeProps) {
  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(onDismiss, NOTICE_MS);
    return () => window.clearTimeout(timeout);
  }, [notice, onDismiss]);

  return (
    <div className="notice" role="status" aria-live="polite">
      {notice && (
        <div className="notice__box">
          <p>{notice.message}</p>
          {notice.action && (
            <button
              type="button"
              className="notice__action"
              onClick={() => {
                notice.action?.onClick();
                onDismiss();
              }}
            >
              {notice.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
