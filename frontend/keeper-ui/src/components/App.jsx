import React, { useState, useLayoutEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
//import HighlightIcon from "@material-ui/icons/Highlight";
import { useEffect } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [contentHeight, setContentHeight] = useState(0);

  const getNotes = () => {
    fetch("/api/notes")
    .then(res => {
      return res.json();
    }).then(notes => {
      console.log(notes);
      setNotes(notes.data);
    }).catch(err=> {
      console.log(err);
    })
  }

  useEffect(() => {
    getNotes();
  }, []);

  useLayoutEffect(() => {
    function updateSize() {
      setContentHeight(window.innerHeight);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  function addNote(newNote) {
    setNotes((prevNotes) => {
      return [...prevNotes, newNote];
    });
  }

  function deleteNote(id) {
    const options = {
      method: "delete",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({"id": id})
    };
    fetch("/api/note", options)
      .then(res => {
        return res.json();
      }).then(result => {
        console.log(result);
        setNotes((prevNotes) => {
          return prevNotes.filter((noteItem, index) => {
            return noteItem._id !== id;
          });
        });
      }).catch(err => {
        console.log(err);
      });

  }

  return (
    <div id="page-container">
      <div id="content-wrap" style={{minHeight: contentHeight }}>
        <Header />
        <CreateArea onAdd={addNote} />
          {notes.map((noteItem, index) => {
            return (
              <Note
                key={noteItem._id}
                id={noteItem._id}
                title={noteItem.title}
                note={noteItem.note}
                onDelete={deleteNote}
              />
            );
          })}
      </div>
      <Footer />
    </div>
  );
}

export default App;
