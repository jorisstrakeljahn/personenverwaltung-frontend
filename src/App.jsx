import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [persons, setPersons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");

    // GET: Alle Personen abrufen
    useEffect(() => {
        fetch('http://localhost:8080/api/persons')
            .then(res => res.json())
            .then(data => {
                const personsWithFlag = data.map(person => ({ ...person, selected: false }));
                setPersons(personsWithFlag);
            })
            .catch(err => console.error("Fehler beim Abrufen:", err));
    }, []);

    const toggleSelect = (id) => {
        setPersons(persons.map(person =>
            person.id === id ? { ...person, selected: !person.selected } : person
        ));
    };

    const filteredPersons = persons.filter(person =>
        (`${person.firstName} ${person.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // POST: Neue Person hinzufügen über den separaten API-Endpunkt
    const handleAddPerson = () => {
        const newPerson = { firstName: newFirstName, lastName: newLastName };
        fetch('http://localhost:8080/api/persons/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPerson)
        })
            .then(res => res.json())
            .then(addedPerson => {
                setPersons([...persons, { ...addedPerson, selected: false }]);
                setNewFirstName("");
                setNewLastName("");
                setModalOpen(false);
            })
            .catch(err => console.error("Fehler beim Hinzufügen:", err));
    };

    // DELETE: Ausgewählte Personen löschen über den separaten API-Endpunkt
    const handleRemovePersons = () => {
        const personsToRemove = persons.filter(person => person.selected);
        Promise.all(
            personsToRemove.map(person =>
                fetch(`http://localhost:8080/api/persons/delete/${person.id}`, { method: 'DELETE' })
            )
        )
            .then(() => {
                setPersons(persons.filter(person => !person.selected));
            })
            .catch(err => console.error("Fehler beim Entfernen:", err));
    };

    return (
        <div className="app-container">
            <div className="content">
                <div className="list-container">
                    <input
                        type="text"
                        placeholder="Suche..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <ul className="person-list">
                        {filteredPersons.map(person => (
                            <li
                                key={person.id}
                                onClick={() => toggleSelect(person.id)}
                                className={person.selected ? 'selected' : ''}
                            >
                                {person.firstName} {person.lastName}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="button-container">
                    <button onClick={() => setModalOpen(true)} className="action-button add-button">
                        Hinzufügen
                    </button>
                    <button onClick={handleRemovePersons} className="action-button remove-button">
                        Entfernen
                    </button>
                </div>
            </div>
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Neue Person hinzufügen</h2>
                        <input
                            type="text"
                            placeholder="Vorname"
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            className="modal-input"
                        />
                        <input
                            type="text"
                            placeholder="Nachname"
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            className="modal-input"
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setModalOpen(false)} className="modal-button cancel-button">
                                Abbrechen
                            </button>
                            <button onClick={handleAddPerson} className="modal-button confirm-button">
                                Hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
