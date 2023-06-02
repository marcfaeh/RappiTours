import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import NotesList from './components/NotesList';
import Search from './components/Search';
import Header from './components/Header';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const App = () => {
  const [notes, setNotes] = useState([]);

  const [searchText, setSearchText] = useState('');

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedNotes = JSON.parse(
      localStorage.getItem('react-notes-app-data')
    );

    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {   
    localStorage.setItem(
      'react-notes-app-data',
      JSON.stringify(notes)
    );
  }, [notes]);

  const addNote = (text, place, date, time) => {
    const newNote = {
      id: nanoid(),
      text: text,
      place: place,
      date: date ? moment(date).format('DD/MM/yyyy') : '', // Überprüfung, ob date nicht null ist
      time: time,
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
  };

  const deleteNote = (id) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
  };

  return (
    <div className={`${darkMode ? 'dark-mode' : ''}`}>
      <div className='container'>
        <Header handleToggleDarkMode={setDarkMode} />
        <Search handleSearchNote={setSearchText} />
        <NotesList
          notes={notes.filter((note) => note.text.toLowerCase().includes(searchText)).sort((a, b) => moment(a.date, 'DD/MM/yyyy') - moment(b.date, 'DD/MM/yyyy'))}
          handleAddNote={addNote}
          handleDeleteNote={deleteNote}
        />
        
      </div>
    </div>
  );
};

export default App;
