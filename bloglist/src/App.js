import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notification, setNotification] = useState({
    message: "",
    type: ""
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, []);

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (e) {
      setNotification({
        message: "wrong username or password",
        type: "error"
      })
      setTimeout(() => {
        setNotification({
          message: "",
          type: ""
        })
      }, 5000);
    }
  }

  const loginForm = () => (
    <div>
      <h2>Login to Application</h2>
      <form onSubmit={handleLogin}>
        username
        <input
          type='text'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        /><br />
        password
        <input
          type='text'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        /> <br />
        <button type='submit'>Login</button>
      </form>
    </div>
  )

  const showBlogs = () => (
    <div>
      <h2>Blogs</h2>
      {user.username} logged in
      <button
        onClick={() => {
          localStorage.removeItem('loggedBlogappUser')
          setUser(null)
        }
        }>logout
      </button>
      <br />

      <h2>Create New Blog</h2>
      <form onSubmit={addBlog}>
        title:
        <input
          type='text'
          value={title}
          onChange={({ target }) => setTitle(target.value)}>
        </input>
        <br />

        author:
        <input
          type='text'
          value={author}
          onChange={({ target }) => setAuthor(target.value)}>
        </input>
        <br />

        url:
        <input
          type='text'
          value={url}
          onChange={({ target }) => setUrl(target.value)}>
        </input>
        <br />

        <button type='submit'>Create</button>
      </form>

      {
        blogs.map(blog =>
          <Blog key={blog.id} blog={blog} />
        )
      }
    </div>
  )

  const addBlog = async (e) => {
    e.preventDefault()

    const BlogObject = {
      title,
      author,
      url
    }

    const newBlog = await blogService.create(BlogObject)
    setBlogs(blogs.concat(newBlog))

    setNotification({
      message: `a new blog ${title} by ${author} added`,
      type: "success"
    })

    setTimeout(() => {
      setNotification({
        message: "",
        type: ""
      })
    }, 5000);

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      {notification.message !== "" && <Notification notification={notification} />}
      {!user ? loginForm() : showBlogs()}
    </div>
  )
}

export default App