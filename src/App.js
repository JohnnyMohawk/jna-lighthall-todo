import React, { useEffect, useState, useRef } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './App.css'


import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '', status: 'Not Started', dueDate: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [sortStyle, setSortStyle] = useState("All Todos")

  const inputRef = useRef(null)

  const today = new Date().toDateString()

  useEffect(() => {
    fetchTodos()
    inputRef.current.focus()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function editStatus(id, status) {
    const updatedTodos = [...todos].map((todo) => {
      if (todo.id === id) {
        todo.status = status
        setInput('status', status)
      }
      return todo;
    });
    setTodos(updatedTodos);
  }

  function editDueDate(id, dueDate) {
    const updatedTodos = [...todos].map((todo) => {
      if (todo.id === id) {
        todo.dueDate = dueDate
        setInput('dueDate', dueDate)
      }
      return todo;
    });
    setTodos(updatedTodos);
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description || !formState.dueDate || !formState.status) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div>
      <div className="sOPad">
        <div className="signOutButton">
          <AmplifySignOut />
        </div>
      </div>
      <div className="responseWS">
        <div className="todoFormContainer">
          <div className="logoDiv">
            <a href="https://lighthall.notion.site/Working-at-Lighthall-069ea38d624547b78361a6a0bf162b4f?p=8ad90c5cefb8429b9a11f3b1dff29709" target="_blank">
              <img src="lighthall-logo.png" alt="lighthall-logo" className="lighthallLogo"></img>
            </a>
            <a href="https://jna-developer.netlify.app/" target="_blank">
              <img src="JohnLogoNoBG.png" alt="john-logo" className="johnLogo"></img>
            </a>
            <img src="todo-logo.png" alt="todo-logo" className="lighthallLogo"></img>
          </div>
          <h2>JNA Lighthall To Do App</h2>
          <input
            onChange={event => setInput('name', event.target.value)}
            value={formState.name}
            placeholder=" To Do"
            ref={inputRef}
          />
          <input
            onChange={e => setInput('description', e.target.value)}
            value={formState.description}
            placeholder=" Description"
          />
          <select name="status" id="status" className="statusDrop" onChange={event => setInput('status', event.target.value)}>
            <option defaultValue="Not Started" value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="Transferred">Transferred</option>
          </select>
          <DatePicker 
            className="dueDatePicker"
            dateFormat="MM-dd-yyyy"
            selected={formState.dueDate ? new Date(formState.dueDate) : undefined} 
            minDate={new Date()}
            onChange={date => {
              let formatDate = date.toDateString()
              setInput('dueDate', formatDate)
            }} 
            placeholderText=" Set Due Date"
          />
          <button onClick={addTodo}>CREATE TODO</button>
        </div>
      
      {todos.length > 0 && (
        <>
        {
          <div className="ifTodosRender">
            <h2 className="date">{today}</h2>
          </div>
        }
        {
          <div className="sortWrap">
            <div className="ifTodosRender">
              <select name="sort" id="sort" className="sortStyleDrop" onChange={event => {
                setSortStyle(event.target.value)
              }}>
                  <option value="" disabled selected>Sort Todos</option>
                  <option value="All Todos">All Todos (In Order of Addition)</option>
                  <option value="Due First">Due First</option>
                  <option value="Due Last">Due Last</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Alphabetically">Alphabetically</option>
              </select>
            </div>
          </div>
        }
        </>
      )}
      {sortStyle === "All Todos" && (
        <>
        {
          todos.map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Not Started" && (
        <>
        {
          todos.filter(todos => (todos.status === "Not Started")).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "In Progress" && (
        <>
        {
          todos.filter(todos => (todos.status === "In Progress")).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Complete" && (
        <>
        {
          todos.filter(todos => (todos.status === "Complete")).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Transferred" && (
        <>
        {
          todos.filter(todos => (todos.status === "Transferred")).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Alphabetically" && (
        <>
        {
          todos.sort((a,b)=>a.name.localeCompare(b.name)).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Due First" && (
        <>
        {
          todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      {sortStyle === "Due Last" && (
        <>
        {
          todos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <p className="todoName">{todo.name}</p>
                <p className="labels">Todo Description:</p>
                <p className="todoDescription">{todo.description}</p>
                <p className="labels">Due Date:</p>
                <DatePicker 
                  className="editDateDrop"
                  dateFormat="MM-dd-yyyy"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined} 
                  minDate={new Date()}
                  onChange={date => {
                    let formatDate = date.toDateString()
                    editDueDate(todo.id, formatDate)
                  }} 
                />
                <p className="labels">Status:</p>
                <select name="status" id="status" className="statusDrop" defaultValue={todo.status} onChange={event => {
                  editStatus(todo.id, event.target.value)
                }}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          ))
        }
        </>
      )}
      </div>
      {console.log(today)}
    </div>
  )
}

export default withAuthenticator(App)