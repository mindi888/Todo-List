import { useState, useRef } from "react"

function StickyNote({ note, onUpdate, onClick }) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const colors = {
    yellow: { bg: "#FFEAAD", border: "#E0BD3F" },
    pink:   { bg: "#FFD6E7", border: "#FB83DD" },
    blue:   { bg: "#C3ECF6", border: "#7BC9DD" },
    green:  { bg: "#D2FFCE", border: "#80C27A" },
  }

  const { bg, border } = colors[note.color] || colors.yellow

  // DRAG
  function handleMouseDown(e) {
    if (e.target.classList.contains("resize-handle")) return
    e.preventDefault()
    dragStart.current = {
      x: e.clientX - note.x,
      y: e.clientY - note.y
    }
    setIsDragging(true)

    function onMove(e) {
      onUpdate({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
    }
    function onUp() {
      setIsDragging(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  // RESIZE
  function handleResizeDown(e) {
    e.stopPropagation()
    e.preventDefault()
    const startW = note.width
    const startH = note.height
    const startX = e.clientX
    const startY = e.clientY

    function onMove(e) {
      onUpdate({
        width: Math.max(160, Math.min(320, startW + e.clientX - startX)),
        height: Math.max(160, Math.min(320, startH + e.clientY - startY))
      })
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  // TOGGLE TASK COMPLETE
  function toggleTask(index) {
    let rawTasks = note.tasks;
    if (typeof rawTasks === "string") {
      try { rawTasks = JSON.parse(rawTasks); } catch { rawTasks = []; }
    }
    const safeTasks = Array.isArray(rawTasks) ? rawTasks : [];
    
    const updated = [...safeTasks];
    if (updated[index]) {
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      onUpdate({ tasks: updated });
    }
  }

  return (
    <div
      className={`sticky-note ${isDragging ? "dragging" : ""}`}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width || 160,
        height: note.height || 160,
        backgroundColor: bg,
        border: `4px solid ${border}`,
      }}
      onMouseDown={handleMouseDown}
      onClick={onClick}
    >
      {/* Title */}
      <div className="sticky-title">{note.title || "Untitled"}</div>

      {/* Tasks */}
      <div className="sticky-tasks">
        {(() => {
          // 1. Force the tasks value to safely convert into an array
          let rawTasks = note.tasks;
          if (typeof rawTasks === "string") {
            try { rawTasks = JSON.parse(rawTasks); } catch { rawTasks = []; }
          }
          const safeTasks = Array.isArray(rawTasks) ? rawTasks : [];

          // 2. Map over our verified array item list safely
          return safeTasks.map((task, i) => (
            <div key={i} className={`sticky-task-row ${task?.completed ? "completed" : ""}`}>
              <button 
                className={`sticky-checkbox ${task?.completed ? "checked" : ""}`} 
                onClick={e => { 
                  e.stopPropagation(); 
                  toggleTask(i);
                }} 
              >
                {task?.completed ? "✓" : ""}
              </button>
              <span className="sticky-task-text">{task?.text || ""}</span>
            </div>
          ));
        })()}
      </div>


      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleResizeDown} />
    </div>
  )
}

export default StickyNote