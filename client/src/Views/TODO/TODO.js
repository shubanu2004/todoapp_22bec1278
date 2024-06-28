import React, { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import { dummy } from './dummy';
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState('');
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);
    const [editModeId, setEditModeId] = useState(null); // Track the todo being edited
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: 'GET',
            url: 'http://localhost:8000/api/todo',
            headers: {
                accept: 'application/json',
            },
        };
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    };

    const addTodo = () => {
        const options = {
            method: 'POST',
            url: 'http://localhost:8000/api/todo',
            headers: {
                accept: 'application/json',
            },
            data: {
                title: newTodo,
                description: '', // Add an empty description for new todos
            },
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => [...prevData, response.data.newTodo]);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const deleteTodo = id => {
        const options = {
            method: 'DELETE',
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: 'application/json',
            },
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.filter(todo => todo._id !== id));
            })
            .catch(err => {
                console.log(err);
            });
    };

    const updateTodo = id => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: 'PATCH',
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: 'application/json',
            },
            data: {
                ...todoToUpdate,
                done: !todoToUpdate.done,
            },
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData =>
                    prevData.map(todo => (todo._id === id ? response.data : todo))
                );
            })
            .catch(err => {
                console.log(err);
            });
    };

    const startEdit = (id, title, description) => {
        setEditModeId(id);
        setEditedTitle(title);
        setEditedDescription(description);
    };

    const saveEdit = async id => {
        const options = {
            method: 'PATCH',
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: 'application/json',
            },
            data: {
                title: editedTitle,
                description: editedDescription,
            },
        };
        try {
            const response = await axios.request(options);
            setTodoData(prevData =>
                prevData.map(todo =>
                    todo._id === id ? { ...todo, title: editedTitle, description: editedDescription } : todo
                )
            );
            setEditModeId(null); // Exit edit mode
        } catch (err) {
            console.log(err);
        }
    };

    const cancelEdit = () => {
        setEditModeId(null); // Exit edit mode without saving
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={event => {
                            setNewTodo(event.target.value);
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo();
                            setNewTodo('');
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : todoData.length > 0 ? (
                    todoData.map((entry, index) => (
                        <div key={entry._id} className={Styles.todo}>
                            {editModeId === entry._id ? ( // Edit mode
                                <div className={Styles.editContainer}>
                                    <input
                                        type='text'
                                        value={editedTitle}
                                        onChange={e => setEditedTitle(e.target.value)}
                                    />
                                    <textarea
                                        value={editedDescription}
                                        onChange={e => setEditedDescription(e.target.value)}
                                    />
                                    <button onClick={() => saveEdit(entry._id)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </div>
                            ) : (
                                // View mode
                                <div className={Styles.infoContainer}>
                                    <input
                                        type='checkbox'
                                        checked={entry.done}
                                        onChange={() => {
                                            updateTodo(entry._id);
                                        }}
                                    />
                                    <span>{entry.title}</span>
                                    <span>{entry.description}</span>
                                    <span
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => startEdit(entry._id, entry.title, entry.description)}
                                    >
                                        Edit
                                    </span>
                                    <span
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            deleteTodo(entry._id);
                                        }}
                                    >
                                        Delete
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                )}
            </div>
        </div>
    );
}
