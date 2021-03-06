import React, { useEffect, useState, useRef } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { animated, useSpring, config } from '@react-spring/web'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react'
import { BsTrash } from 'react-icons/bs'
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

  async function removeTodo(todoId) {
    try {
        let myTodo
        todos.map((todo) => {
            if (todo.id === todoId) {
                myTodo = todo
                return myTodo
            }
            return todo;
        });
        await API.graphql(graphqlOperation(deleteTodo, { input: { id: myTodo.id } }))
        fetchTodos()
    } catch (err) {
        console.log('error deleting todo:', err)
    }
  }

  async function editStatus(todoId, todoStatus) {
    try {
        let myTodo
        const updatedTodos = todos.map((todo) => {
            if (todo.id === todoId) {
                myTodo = todo
                myTodo.status = todoStatus
                return myTodo
            }
            return todo;
        });
        await API.graphql(graphqlOperation(updateTodo, { input: { status: myTodo.status, id: myTodo.id } }))
        setTodos(updatedTodos);
    } catch (err) {
        console.log('error updating todo:', err)
    }
  }

  async function editDueDate(todoId, todoDueDate) {
    try {
        let myTodo
        const updatedTodos = todos.map((todo) => {
            if (todo.id === todoId) {
                myTodo = todo
                myTodo.dueDate = todoDueDate
                return myTodo
            }
            return todo;
        });
        await API.graphql(graphqlOperation(updateTodo, { input: { dueDate: myTodo.dueDate, id: myTodo.id } }))
        setTodos(updatedTodos);
    } catch (err) {
        console.log('error updating todo:', err)
    }
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
      const newTodo = await API.graphql(graphqlOperation(createTodo, {input: todo}))
      setTodos([...todos, newTodo.data.createTodo])
      setFormState(initialState)
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
    }else if(event === "All Todos"){
      setSortedTodoArr(todos)
    }
  }

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
                  <option value="All Todos">All Todos</option>
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
        <animated.div style={fadeStyles}>
        {
          sortedTodoArr.map((todo, index) => (
            <div key={todo.id ? todo.id : index} className="todo">
              <div className="todoCard">
                <div className="todoName">
                  <p>{todo.name}</p>
                  <BsTrash className="trash" onClick={() => removeTodo(todo.id)} />
                </div>
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
