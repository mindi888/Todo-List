import { useState, useRef } from "react"

function StickyNote({ note, onUpdate, onClick, boardRef, onDragOffBoard }) {
  const [isDragging, setIsDragging] = useState(false)
  const [offBoard, setOffBoard] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)

  const colors = {
    yellow: { bg: "#FFEAAD", border: "#E0BD3F" },
    pink:   { bg: "#FFD6E7", border: "#FB83DD" },
    blue:   { bg: "#C3ECF6", border: "#7BC9DD" },
    green:  { bg: "#D2FFCE", border: "#80C27A" },
  }

  const { bg, border } = colors[note.color] || colors.yellow

  function isInsideBoard(clientX, clientY) {
    if (!boardRef?.current) return true
    const rect = boardRef.current.getBoundingClientRect()
    return (
      clientX >= rect.left && clientX <= rect.right &&
      clientY >= rect.top && clientY <= rect.bottom
    )
  }

  function handleMouseDown(e) {
    if (e.target.classList.contains("resize-handle")) return
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    didDrag.current = false

    dragStart.current = {
      x: e.clientX - note.x,
      y: e.clientY - note.y
    }

    function onMove(e) {
      const dx = Math.abs(e.clientX - startX)
      const dy = Math.abs(e.clientY - startY)
      if (dx > 4 || dy > 4) didDrag.current = true

      setIsDragging(true)
      onUpdate({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
      setOffBoard(!isInsideBoard(e.clientX, e.clientY))
    }

    function onUp(e) {
      setIsDragging(false)
      setOffBoard(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)

      if (!isInsideBoard(e.clientX, e.clientY)) {
        onDragOffBoard()
      }
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  function handleClick(e) {
    if (didDrag.current) return  // ignore clicks after dragging
    onClick?.(e)
  }

  function handleResizeDown(e) {
    e.stopPropagation()
    e.preventDefault()
    didDrag.current = true  // prevent click firing after resize
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

  function toggleTask(index, e) {
    e.stopPropagation()
    let rawTasks = note.tasks
    if (typeof rawTasks === "string") {
      try { rawTasks = JSON.parse(rawTasks) } catch { rawTasks = [] }
    }
    const safeTasks = Array.isArray(rawTasks) ? [...rawTasks] : []
    if (safeTasks[index]) {
      safeTasks[index] = { ...safeTasks[index], completed: !safeTasks[index].completed }
      onUpdate({ tasks: safeTasks })
    }
  }

  let rawTasks = note.tasks
  if (typeof rawTasks === "string") {
    try { rawTasks = JSON.parse(rawTasks) } catch { rawTasks = [] }
  }
  const safeTasks = Array.isArray(rawTasks) ? rawTasks : []

  return (
    <>
      <div
        className={`sticky-note ${isDragging ? "dragging" : ""} ${note.deleting ? "deleting" : ""}`}
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
        onClick={handleClick}
      >
        <div className="sticky-title">{note.title || "Untitled"}</div>

        <div className="sticky-tasks">
          {safeTasks.map((task, i) => (
            <div key={i} className={`sticky-task-row ${task?.completed ? "completed" : ""}`}>
              <button
                className={`sticky-checkbox ${task?.completed ? "checked" : ""}`}
                onClick={e => toggleTask(i, e)}
              >
                {task?.completed ? "✓" : ""}
              </button>
              <span className="sticky-task-text">{task?.text || ""}</span>
            </div>
          ))}
        </div>

        <div className="resize-handle" onMouseDown={handleResizeDown} />

        {/* Trash shows on the note itself when dragged off board */}
        {offBoard && (
          <div className="note-trash-overlay">🗑️</div>
        )}
      </div>
    </>
  )
}

export default StickyNote