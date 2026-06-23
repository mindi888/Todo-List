import { useState, useEffect, useRef } from "react"
import './App.css'
import cat from "./assets/cat.svg"
import shelf from "./assets/shelf.svg"
import toto from "./assets/toto.svg"
import plant from "./assets/plant.svg"
import pencilHolder from "./assets/pencil-holder.svg"
import noteStack from "./assets/note-stack.svg"
import NoteModal from "./components/NoteModal"
import StickyNote from "./components/StickyNote.jsx"

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
  const boardRef = useRef(null)

  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null) // note being edited
  const [pendingNote, setPendingNote] = useState(null) // note following cursor
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [draggingOffBoard] = useState(false)

  useEffect(() => {
    fetch(API_BASE_URL + "/todos")
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Failed to fetch todos:", err))
  }, [])

  // Track cursor for pending note
  useEffect(() => {
    if (!pendingNote) return
    function onMove(e) {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [pendingNote])

  async function handleCreateNote(newNote) {
  if (!newNote) {
    setShowModal(false);
    return;
  }
  
  // Clean the note data IMMEDIATELY before attaching it to the cursor
  const cleanNote = {
    title: newNote.title || "Untitled",
    color: newNote.color || "yellow", // Guarantee color is never undefined
    tasks: Array.isArray(newNote.tasks) ? newNote.tasks : [], // Guarantee tasks is a real array
  };

  setPendingNote(cleanNote);
  setShowModal(false);
}

async function placePendingNote(e) {
  if (!pendingNote) return;
  const board = boardRef.current;
  if (!board) return;
  const rect = board.getBoundingClientRect();

  if (
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom
  ) {
    const x = e.clientX - rect.left - 80;
    const y = e.clientY - rect.top - 80;

    // 2. Convert pixels to exact percentage coordinates (0 - 100)
    const xPct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const yPct = Math.max(0, Math.min(100, (y / rect.height) * 100))
    
    // Default size: notes take up roughly 15% of the board's width/height
    const widthPct = 15 
    const heightPct = 15

    try {
      const res = await fetch(API_BASE_URL + "/todos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          title: pendingNote.title,
          color: pendingNote.color,
          tasks: pendingNote.tasks,
          status: "empty",
          x: xPct,
          y: yPct,
          width: widthPct,
          height: heightPct,
        })
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const saved = await res.json();
      setNotes(prev => [...prev, saved]);
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Could not save the note to the server.");
    }
  }
  setPendingNote(null);
}

  async function handleUpdateNote(id, updates) {
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()

    // Convert raw incoming drag/resize pixel updates into percentages on the fly
    const pctUpdates = { ...updates }
    if (updates.x !== undefined) pctUpdates.x = (updates.x / rect.width) * 100
    if (updates.y !== undefined) pctUpdates.y = (updates.y / rect.height) * 100
    if (updates.width !== undefined) pctUpdates.width = (updates.width / rect.width) * 100
    if (updates.height !== undefined) pctUpdates.height = (updates.height / rect.height) * 100

    // Update local state optimistically using percentages
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...pctUpdates } : n))

    try {
      await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pctUpdates)
      })
    } catch (err) {
      console.error("Failed to update note:", err)
    }
  }

  async function handleDeleteNote(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, deleting: true } : n))
    setTimeout(async () => {
      setNotes(prev => prev.filter(n => n.id !== id))
      try {
        await fetch(`${API_BASE_URL}/todos/${id}`, { method: "DELETE" })
      } catch (err) {
        console.error("Failed to delete note:", err)
      }
    }, 300)
  }

  async function handleEditNote(updatedNote) {
    if (!editingNote) return
    const id = editingNote.id
    setEditingNote(null)
    await handleUpdateNote(id, {
      title: updatedNote.title,
      color: updatedNote.color,
      tasks: updatedNote.tasks,
    })
  }

  return (
    <div
      className="app"
      onClick={pendingNote ? placePendingNote : undefined}
    >
      {/* Bulletin board */}
      <div
        className="bulletin-board"
        ref={boardRef}
      >
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            boardRef={boardRef}
            onUpdate={(updates) => handleUpdateNote(note.id, updates)}
            onDelete={() => handleDeleteNote(note.id)}
            onClick={() => {
              if (!pendingNote) setEditingNote(note)
            }}
            onDragOffBoard={() => handleDeleteNote(note.id)}
          />
        ))}
      </div>

      {/* Pending note follows cursor */}
      {pendingNote && (
        <div
          className="pending-note"
          style={{
            left: cursorPos.x - 80,
            top: cursorPos.y - 80,
            backgroundColor: {
              yellow: "#FFEAAD", pink: "#FFD6E7",
              blue: "#C3ECF6", green: "#D2FFCE"
            }[pendingNote.color],
            border: `4px solid ${{
              yellow: "#E0BD3F", pink: "#FB83DD",
              blue: "#7BC9DD", green: "#80C27A"
            }[pendingNote.color]}`,
          }}
        >
          <div className="sticky-title">{pendingNote.title || "Untitled"}</div>
        </div>
      )}

      {/* Trash indicator when dragging off board */}
      {draggingOffBoard && (
        <div className="trash-indicator">🗑️</div>
      )}

      <div className="desk">
        <img src={shelf} className="deco shelf" alt="" />
        <img src={pencilHolder} className="deco pencil-holder" alt="" />
        <img src={plant} className="deco plant" alt="" />
        <img src={toto} className="deco toto" alt="" />
        <img src={cat} className="deco cat" alt="" />
        <img
          src={noteStack}
          className="deco note-stack"
          alt=""
          onClick={e => { e.stopPropagation(); setShowModal(true) }}
        />
      </div>

      {showModal && (
        <NoteModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateNote}
        />
      )}

      {editingNote && (
        <NoteModal
          onClose={() => setEditingNote(null)}
          onCreate={handleEditNote}
          initialNote={editingNote}
        />
      )}
    </div>
  )
}

export default App