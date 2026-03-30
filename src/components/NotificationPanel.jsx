import { useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import useNotifications from "../store/notifications.js";

const TYPE_DOT = {
  info: "#7DD3FC",
  success: "#6EE7B7",
  warning: "#FBBF24",
  error: "#FB7185",
};

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "yesterday";
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const notifications = useNotifications((s) => s.notifications);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const removeNotification = useNotifications((s) => s.removeNotification);
  const clearAll = useNotifications((s) => s.clearAll);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, onClose]);

  if (!open) return null;

  const mono = "JetBrains Mono, monospace";
  const space = "Space Grotesk, sans-serif";

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        width: 380,
        maxHeight: 480,
        overflowY: "auto",
        background: "#1A1F2E",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: space,
            fontSize: 14,
            fontWeight: 700,
            color: "#E2E8F0",
            flex: 1,
            minWidth: 0,
          }}
        >
          Notifications
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              color: "#1A1F2E",
              background: "#6EE7B7",
              borderRadius: 999,
              padding: "2px 8px",
              lineHeight: 1.4,
            }}
          >
            {unreadCount}
          </span>
        )}
        <button
          type="button"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: unreadCount === 0 ? "#3B4252" : "#6EE7B7",
            cursor: unreadCount === 0 ? "default" : "pointer",
            background: "none",
            border: "none",
            padding: 0,
            whiteSpace: "nowrap",
          }}
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Bell size={32} strokeWidth={1.5} style={{ color: "#2A3040" }} />
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: "#3B4252",
            }}
          >
            No notifications
          </span>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => markRead(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  markRead(n.id);
                }
              }}
              style={{
                position: "relative",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                background: n.read ? "transparent" : "rgba(110,231,183,0.03)",
                cursor: "pointer",
                outline: "none",
              }}
              className="notification-row"
            >
              <button
                type="button"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(n.id);
                }}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  opacity: 0,
                  transition: "opacity 120ms ease",
                }}
                className="notification-dismiss"
              >
                <X size={14} style={{ color: "#3B4252" }} />
              </button>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  paddingRight: 28,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: TYPE_DOT[n.type] ?? TYPE_DOT.info,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      fontWeight: 600,
                      color: n.read ? "#6B7280" : "#D1D5DB",
                      marginBottom: 4,
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: "#4B5563",
                      lineHeight: "16px",
                      marginBottom: 6,
                    }}
                  >
                    {n.message}
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      color: "#3B4252",
                    }}
                  >
                    {timeAgo(n.time)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => clearAll()}
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "#4B5563",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FB7185";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#4B5563";
            }}
          >
            Clear all
          </button>
        </div>
      )}

      <style>{`
        .notification-row:hover .notification-dismiss {
          opacity: 1;
        }
        .notification-dismiss:hover svg {
          color: #6B7280 !important;
        }
      `}</style>
    </div>
  );
}
