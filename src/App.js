import React, { useEffect, useState, useRef } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { animated, useSpring, config } from '@react-spring/web'
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
  const [sortStyle, setSortStyle] = useState("Due First")
  const [showDiv, setShowDiv] = useState(todos.length ? true : false)
  const [showForm, setShowForm] = useState(false)
  const [sortedTodoArr, setSortedTodoArr] = useState(todos)

  const inputRef = useRef(null)
  const today = new Date().toDateString()

  const fadeStyles = useSpring({
    config: { ...config.molasses },
    from: { opacity: 0 },
    to: {
      opacity: showDiv ? 1 : 0
    }
  });

  const fadeStyles2 = useSpring({
    config: { ...config.molasses },
    from: { opacity: 0 },
    to: {
      opacity: showForm ? 1 : 0
    }
  });
  

  useEffect(() => {
    fetchTodos()
    setShowForm(true)
    inputRef.current.focus()
  }, [])

  useEffect(() => {
    setShowDiv(todos.length ? true : false)
    sortTodos(sortStyle)
  }, [todos, sortStyle])

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

  function sortTodos(event) {
    if (event === "Not Started" || event === "In Progress" || event === "Complete" || event === "Transferred") {
      setSortedTodoArr(todos.filter(todos => (todos.status === sortStyle)))
    }else if(event === "Due First"){
      setSortedTodoArr(todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)))
    }else if(event === "Due Last"){
      setSortedTodoArr(todos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)))
    }else if(event === "Alphabetically"){
      setSortedTodoArr(todos.sort((a,b)=>a.name.localeCompare(b.name)))
    }else if(sortStyle === "All Todos"){
      setSortedTodoArr(todos)
    }
  }

  // function sortTodos() {
  //   let sortedTodos
  //   if (sortStyle === "Not Started" || sortStyle === "In Progress" || sortStyle === "Complete" || sortStyle === "Transferred") {
  //     sortedTodos = todos.filter(todos => (todos.status === sortStyle))
  //     setSortedTodoArr(sortedTodos)
  //   }else if(sortStyle === "Due First"){
  //     sortedTodos = todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  //     setSortedTodoArr(sortedTodos)
  //   }else if(sortStyle === "Due Last"){
  //     sortedTodos = todos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
  //     setSortedTodoArr(sortedTodos)
  //   }else if(sortStyle === "Alphabetically"){
  //     sortedTodos = todos.sort((a,b)=>a.name.localeCompare(b.name))
  //     setSortedTodoArr(sortedTodos)
  //   }else if(sortStyle === "All Todos"){
  //     sortedTodos = todos
  //     setSortedTodoArr(sortedTodos)
  //   }
  // }

  return (
    <div>
      <animated.div style={fadeStyles2} className="sOPad">
        <div className="signOutButton">
          <AmplifySignOut />
        </div>
      </animated.div>
      <div className="responseWS">
        <animated.div style={fadeStyles2} className="todoFormContainer">
          <div className="logoDiv">
            <a href="https://lighthall.notion.site/Working-at-Lighthall-069ea38d624547b78361a6a0bf162b4f?p=79fc104333ee40cc8030a2ea7381b80c" target="_blank" rel="noreferrer">
              <img src="lighthall-logo.png" alt="lighthall-logo" className="lighthallLogo"></img>
            </a>
            <a href="https://jna-developer.netlify.app/" target="_blank" rel="noreferrer">
              <img src="JohnLogoNoBG.png" alt="john-logo" className="johnLogo"></img>
            </a>
            <a href="https://github.com/JohnnyMohawk/jna-lighthall-todo" target="_blank" rel="noreferrer">
              <img src="github-logo.png" alt="todo-logo" className="lighthallLogo"></img>
            </a>
          </div>
          <h2>JNA Lighthall To Do App</h2>
          <input
            className="input-text-form just-text"
            onChange={event => setInput('name', event.target.value)}
            value={formState.name}
            placeholder=" To Do"
            ref={inputRef}
          />
          <input
            className="input-text-form just-text"
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
        </animated.div>
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
                sortTodos(event.target.value)
              }}>
                  <option value="" disabled selected>Sort Todos (Currently Displaying: Due First)</option>
                  <option value="All Todos">All Todos (In Order of Addition)</option>
                  <option value="Due First">Due First</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Alphabetically">Alphabetically</option>
                  <option value="Due Last">Due Last</option>
              </select>
            </div>
          </div>
        }
        </animated.div>
        <animated.div style={fadeStyles}>
        {
          sortedTodoArr.map((todo, index) => (
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
        </animated.div>
      </div>
    </div>
  )
}

export default withAuthenticator(App)

