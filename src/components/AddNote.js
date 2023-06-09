import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const AddNote = ({ handleAddNote }) => {
  const characterLimit = 200;
  const [noteText, setNoteText] = useState('');
  const [notePlace, setNotePlace] = useState('');
  const [noteTime, setNoteTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (event) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNoteText(event.target.value);
    }
  };

  const handleChange2 = (event) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNotePlace(event.target.value);
    }
  };

  const handleSaveClick = () => {
    if (noteText.trim().length > 0) {
      const formattedDate = selectedDate ? moment(selectedDate).format('DD/MM/yyyy') : null;
      const selectedDateTime = selectedDate && noteTime ? moment(`${formattedDate} ${noteTime}`, 'DD/MM/yyyy HH:mm').toDate() : null;
      handleAddNote(noteText, notePlace, selectedDateTime, noteTime);
      setNoteText('');
      setNotePlace('');
      setNoteTime('');
      setSelectedDate(null);
    }
  };

  return (
    <div className='note new'>
      <textarea
        rows='5'
        cols='10'
        placeholder='Type to add a note...'
        value={noteText}
        onChange={handleChange}
      ></textarea>
      <textarea
        rows='1'
        cols='10'
        placeholder='Type to add a place...'
        value={notePlace}
        onChange={handleChange2}
      ></textarea>

      <ReactDatePicker
        className='datePicker'
        selected={selectedDate}
        onChange={date => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
      />

      <input
        className='timePicker'
        type='time'
        value={noteTime}
        onChange={(event) => setNoteTime(event.target.value)}
      />

      <div className='note-footer'>
        <small>{characterLimit - noteText.length} Remaining</small>
        <button className='save' onClick={handleSaveClick}>
          Save
        </button>
      </div>
    </div>
  );
};

export default AddNote;
