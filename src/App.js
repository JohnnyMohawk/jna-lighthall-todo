import React, { useEffect, useState, useRef } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { animated, useTransition, useSpring, config } from '@react-spring/web'
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
  const [showDiv, setShowDiv] = useState(false)

  const inputRef = useRef(null)
  const today = new Date().toDateString()

  const listTransitions = useTransition(todos, {
    config: config.gentle,
    from: { opacity: 0, transform: "translate3d(-25%, 0px, 0px)" },
    enter: { opacity: 1, transform: "translate3d(0%, 0px, 0px)" },
    leave: { opacity: 0, height: 0, transform: "translate3d(25%, 0px, 0px)" },
    keys: todos.map((todo, index) => index)
  });

  const fadeStyles = useSpring({
    config: { ...config.stiff },
    from: { opacity: 0 },
    to: {
      opacity: showDiv ? 1 : 0
    }
  });

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
      setShowDiv(true)
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
            className="input-text-form"
            onChange={event => setInput('name', event.target.value)}
            value={formState.name}
            placeholder=" To Do"
            ref={inputRef}
          />
          <input
            className="input-text-form"
            onChange={e => setInput('description', e.target.value)}
            value={formState.description}
            placeholder=" Description"
          />
          <select name="status" id="status" className="statusDrop input-text-form" onChange={event => setInput('status', event.target.value)}>
            <option defaultValue="Not Started" value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="Transferred">Transferred</option>
          </select>
          <DatePicker 
            className="dueDatePicker input-text-form1"
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
      {/* {todos.length > 0 && (
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
                  <option value="" disabled selected>Sort Todos (Current: All Todos)</option>
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
      )} */}
      {/* <button onClick={() => setShowDiv(val => !val)}>Toggle</button> */}
      {/* {todos.length > 0 && (
        <>
        {setShowDiv(true)}
        </>
      )} */}
        <animated.div style={fadeStyles}>
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
                  <option value="" disabled selected>Sort Todos (Current: All Todos)</option>
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
        </animated.div>

      {sortStyle === "All Todos" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Not Started" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "In Progress" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Complete" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Transferred" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Alphabetically" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Due First" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      {sortStyle === "Due Last" && (
        <>
        <ul>
        {
          listTransitions((styles, todo, index) => (
            <animated.div style={styles} key={todo.id ? todo.id : index} className="todo">
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
            </animated.div>
          ))
        }
        </ul>
        </>
      )}
      </div>
      {console.log(today)}
    </div>
  )
}

export default withAuthenticator(App)