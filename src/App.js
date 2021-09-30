import React, { useEffect, useState } from 'react'
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


  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
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
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div className="container">
      <AmplifySignOut />
      <h2>JNA Lighthall Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        value={formState.description}
        placeholder="Description"
      />
      <select name="status" id="status" className="statusDrop" onChange={event => setInput('status', event.target.value)}>
          <option defaultValue="Not Started" value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
          <option value="Transferred">Transferred</option>
        </select>
      <DatePicker 
        dateFormat="MM-dd-yyyy"
        selected={formState.dueDate ? new Date(formState.dueDate) : undefined} 
        minDate={new Date()}
        onChange={date => {
          let formatDate = date.toDateString()
          setInput('dueDate', formatDate)
        }} 
        placeholderText="Pick a Date"
      />
      <button onClick={addTodo}>Create Todo</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} className="todo">
            <p className="todoName">{todo.name}</p>
            <p className="todoDescription">{todo.description}</p>
            <p className="todoDescription">{todo.status}</p>
            <p className="todoDescription">{todo.dueDate}</p>
          </div>
        ))
      }
    </div>
  )
}

export default withAuthenticator(App)