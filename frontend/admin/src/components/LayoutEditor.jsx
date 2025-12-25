import { useState, useRef, useEffect } from "react";
import GridLayout from "react-grid-layout";
import api from "../services/api";
import { BACKEND_URL } from "../config";
import { socket } from "../services/socket";
import { getRole } from "../utils/auth";

import Announcements from "./widgets/Announcements";
import Drives from "./widgets/Drives";
import Spotlight from "./widgets/Spotlight";
import Stats from "./widgets/Stats";
import PdfSlideshow from "./widgets/PdfSlideshow";
import YoutubePlayer from "./widgets/YoutubePlayer";
import MediaSlideshow from "./widgets/MediaPlaylistEditor";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const WIDGETS = {
  announcements: Announcements,
  drives: Drives,
  spotlight: Spotlight,
  stats: Stats,
  pdfslideshow: PdfSlideshow,
  youtube: YoutubePlayer,
  mediaSlideshow: MediaSlideshow,
};

export default function LayoutEditor({initialState}) {
  const [layout, setLayout] = useState([]);
  const hasInitialized = useRef(false);

  const role = getRole();
  const isEditor = role === "EDITOR";

  useEffect(() => {
    if (initialState?.layout && !hasInitialized.current) {
      setLayout(initialState.layout);
      hasInitialized.current = true;
    }
  }, [initialState]);

  useEffect(() => {
    socket.on("INIT_STATE", (state) => {
      if (state.layout) {
        setLayout(state.layout);
      }
    });

    return () => {
      socket.off("INIT_STATE");
      socket.off("DASHBOARD_UPDATE");
    };
  }, []);

  const canvasRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      setGridWidth(canvasRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
  const handleUpdate = (state) => {
    if (state.layout) {
      setLayout(state.layout);
    }
  };

  socket.on("DASHBOARD_UPDATE", handleUpdate);

  return () => {
    socket.off("DASHBOARD_UPDATE", handleUpdate);
  };
}, []);

  const isWidgetAdded = (type) =>
    layout.some((item) => item.i.startsWith(type + "-"));

  const addWidget = (type) => {
    if (isWidgetAdded(type)) return;

    setLayout((prev) => [
      ...prev,
      {
        i: `${type}-${Date.now()}`,
        x: 0,
        y: 0,
        w: 4,
        h: 2,
      },
    ]);
  };

  const removeWidget = (id) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
  };

  const pushToTV = async () => {
    await api.post(`${BACKEND_URL}/update-layout`, { layout });
    alert("Layout pushed to TV");
  };

  const handleLayoutChange = (newLayout) => {
    setLayout((prev) => {
      // Prevent unnecessary re-renders
      if (JSON.stringify(prev) === JSON.stringify(newLayout)) {
        return prev;
      }
      return newLayout;
    });
  };

  const clearWidgets = async () => {
    setLoading(true);
    setMsg("");

    try {
      setLayout([]);
      await api.post(`${BACKEND_URL}/clear-widgets`);
      setMsg("All widgets cleared");
    } catch {
      setMsg("Failed to clear widgets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin">
      <aside className="palette">
        <div className="palette-content">
          <h4>Widgets</h4>

          {Object.keys(WIDGETS).map((key) => (
            <button
              key={key}
              onClick={() => isEditor && addWidget(key)}
              disabled={isWidgetAdded(key) || !isEditor}
              title={!isEditor ? "Read-only access" : isWidgetAdded(key) ? "Widget already added" : `Add ${key} widget`}
            >
              ➕ {key}
            </button>
          ))}

          <button
            className="push"
            onMouseDown={(e) => e.stopPropagation()}
            disabled={loading || !isEditor}
            onClick={isEditor && pushToTV}
            title={!isEditor ? "Read-only access" : "Upload layout to TV"}
          >
            🚀 Push to TV
          </button>
          <button
            className="clear"
            onClick={() => {
              if (!isEditor || loading) return;
              if (!window.confirm("Clear all widgets? This cannot be undone."))
                return;
              clearWidgets();
            }}
            disabled={loading || !isEditor}
            title={!isEditor ? "Read-only access" : "Clear all widgets from TV"}
          >
            🗑 Clear All Widgets
          </button>
        </div>
      </aside>

      {/* CANVAS */}
      <main className="canvas" ref={canvasRef}>
        <GridLayout
          layout={layout}
          cols={12}
          rowHeight={90}
          width={gridWidth}
          onLayoutChange={handleLayoutChange}
          isResizable={isEditor}
          isDraggable={isEditor}
          static={!isEditor}
          compactType="vertical"
          verticalCompact={true}
          maxRows={6}
          isBounded={true}
          draggableHandle=".widget"
          draggableCancel=".delete-btn, button, textarea, input"
        >
          {layout.map((item) => {
            const type = item.i.split("-")[0];
            const Comp = WIDGETS[type];

            if (!Comp) return null;

            return (
              <div key={item.i} className="widget">
                <button
                  className="delete-btn"
                  onClick={() => isEditor && removeWidget(item.i)}
                  disabled={!isEditor}
                  title={!isEditor ? "Read-only access" : "Delete widget"}
                >
                  ✕
                </button>

                <Comp />
              </div>
            );
          })}
        </GridLayout>
      </main>
    </div>
  );
}
