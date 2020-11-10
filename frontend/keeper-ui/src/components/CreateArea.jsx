import React, { useState} from "react";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";

function CreateArea(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState({
    title: "",
    note: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote((prevNote) => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  function submitNote(event) {
    event.preventDefault();
    const options = {
      method: "post",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(note)
    };

    if(note && note.title && note.note){
      fetch(process.env.REACT_APP_API_URL + "/api/note", options)
      .then(res => {
        return res.json();
      }).then(result => {
        note["_id"] = result.insertedId
        props.onAdd(note);
        setNote({ title: "", note: ""});
      }).catch(err => {
        console.log(err)
      });
    }
    

  }

  function expand(event) {
    setIsExpanded(true);
  }

  return (
    <div>
      <form className="create-note">
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
            maxLength="50"
          />
        )}
        <textarea
          onClick={expand}
          name="note"
          onChange={handleChange}
          value={note.note}
          placeholder="Take a note..."
          rows={isExpanded ? "3" : "1"}
          maxLength="200"
        />
        <Zoom in={isExpanded}>
          <Fab onClick={submitNote}>
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
