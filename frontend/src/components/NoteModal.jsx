import { useState } from "react"

function NoteModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("")
  const [color, setColor] = useState("yellow")
  const [tasks, setTasks] = useState([{ text: "", completed: false }])

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

  function deleteTask(index) {
    if (tasks.length === 1) {
      setTasks([{ text: "", completed: false }])
      return
    }
    setTasks(tasks.filter((_, i) => i !== index))
  }

  function handleCreate() {
    const hasTitle = title.trim().length > 0
    const hasTasks = tasks.some(t => t.text.trim().length > 0)
    if (!hasTitle && !hasTasks) return
    onCreate({
      title: title.trim(),
      color,
      tasks: tasks.filter(t => t.text.trim().length > 0)
    })
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
                style={{ backgroundColor: bgc, borderColor: color === name ? bdc : "transparent" }}
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
              placeholder="TITLE"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <div className="modal-tasks">
              {tasks.map((task, i) => (
                <div key={i} className="task-row">
                  <div className="task-checkbox" />
                  <input
                    className="task-input"
                    placeholder="click to add a task..."
                    value={task.text}
                    onChange={e => updateTask(i, e.target.value)}
                  />
                  {task.text.length > 0 && (
                    <button className="task-trash" onClick={() => deleteTask(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>

          </div>

          <button className="modal-done" onClick={handleCreate}>DONE</button>
        </div>

        {/* RIGHT — Status only now */}
        <div className="modal-right">
          <span className="modal-label">STATUS</span>
          <div className="status-info">
            <div className="status-example">
              <div className="task-checkbox" /> <span>Not done</span>
            </div>
            <div className="status-example">
              <div className="task-checkbox checked">✓</div> <span>Done</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default NoteModal