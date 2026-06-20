import { useState } from "react"

function NoteModal({ onClose, onCreate, initialNote }) {
  const [title, setTitle] = useState(initialNote?.title || "")
  const [color, setColor] = useState(initialNote?.color || "yellow")
  const [tasks, setTasks] = useState(() => {
    let t = initialNote?.tasks || []
    if (typeof t === "string") { try { t = JSON.parse(t) } catch { t = [] } }
    return [...t, { text: "", completed: false }]
  })

  const colors = {
    yellow: { bg: "#FFEAAD", border: "#E0BD3F" },
    pink:   { bg: "#FFD6E7", border: "#FB83DD" },
    blue:   { bg: "#C3ECF6", border: "#7BC9DD" },
    green:  { bg: "#D2FFCE", border: "#80C27A" },
  }

  function updateTask(index, text) {
    const updated = [...tasks]
    updated[index].text = text
    if (index === tasks.length - 1 && text.length > 0) {
      updated.push({ text: "", completed: false })
    }
    setTasks(updated)
  }

  function toggleTask(index) {
    const updated = [...tasks]
    updated[index] = { ...updated[index], completed: !updated[index].completed }
    setTasks(updated)
  }

  function deleteTask(index) {
    if (tasks.length === 1) {
      setTasks([{ text: "", completed: false }])
      return
    }
    setTasks(tasks.filter((_, i) => i !== index))
  }

  function handleDone() {
    const cleanTasks = tasks.filter(t => t.text.trim().length > 0)
    const hasTitle = title.trim().length > 0
    const hasTasks = cleanTasks.length > 0
    // Always close — only create/update if there's content
    if (hasTitle || hasTasks) {
      onCreate({ title: title.trim(), color, tasks: cleanTasks })
    }
    onClose()
  }

  const { bg, border } = colors[color]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* LEFT — Color */}
        <div className="modal-left">
          <span className="modal-label">COLOR</span>
          <div className="color-grid">
            {Object.entries(colors).map(([name, { bg: bgc, border: bdc }]) => (
              <button
                key={name}
                className={`color-btn ${color === name ? "selected" : ""}`}
                style={{ 
                  backgroundColor: bgc,
                  boxShadow: `inset 0 0 0 3px ${bdc}`,  // inner ring shows border color
                  outline: color === name ? "3px solid #8f6346ff" : "3px solid transparent",
                  outlineOffset: "3px"
                }}
                onClick={() => setColor(name)}
              />
            ))}
          </div>
        </div>

        {/* CENTER — Preview */}
        <div className="modal-center">
          <div className="modal-note-preview" style={{ backgroundColor: bg, borderColor: border }}>
            <input
              className="modal-title-input"
              placeholder="UNTITLED"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="modal-tasks">
              {tasks.map((task, i) => (
                <div key={i} className={`task-row ${task.completed ? "task-completed" : ""}`}>
                  <button
                    className={`task-checkbox-btn ${task.completed ? "checked" : ""}`}
                    onClick={() => toggleTask(i)}
                  >
                    {task.completed ? "✓" : ""}
                  </button>
                  <input
                    className="task-input"
                    placeholder="click to add a task..."
                    value={task.text}
                    onChange={e => updateTask(i, e.target.value)}
                    style={{ textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.5 : 1 }}
                  />
                  {task.text.length > 0 && (
                    <button className="task-trash" onClick={() => deleteTask(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="modal-done" onClick={handleDone}>
            {initialNote ? "SAVE" : "DONE"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteModal