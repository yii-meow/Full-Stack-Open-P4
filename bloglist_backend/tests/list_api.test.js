const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Bloglist = require('../models/bloglist')
const User = require('../models/user')

beforeEach(async () => {
    await Bloglist.deleteMany({})
    await User.deleteMany({})

    for (let bloglist of helper.initialBloglists) {
        let bloglistObject = new Bloglist(bloglist)
        await bloglistObject.save()
    }

    // Intialize temp user for jwt token
    await api
        .post('/api/users')
        .send({
            username: "temp",
            password: "temp"
        })

    // Intialize temp user for jwt token
    await api
        .post('/api/users')
        .send({
            username: "test",
            password: "test"
        })
})

describe("Creating User", () => {
    test("Invalid user is not created", async () => {
        const newUser = {
            username: "yiyimiao",
            password: "yi",
            name: "yiyi"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test("duplicated username is not allowed", async () => {
        const newUser = {
            username: "temp",
            password: "temp",
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})

const authorizationHeader = async () => {
    // Login the user and get token
    const loginUser = await api
        .post('/api/login')
        .send({
            username: "temp",
            password: "temp"
        })

    return {
        Authorization: `Bearer ${loginUser.body.token}`
    }
}

describe('saving or updating new blogs', () => {
    test('success saving blog with valid data', async () => {
        const blogAtStart = await helper.bloglistsInDb()

        const newBlog = {
            title: "abc",
            author: "yiyi",
            url: "google.com"
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set(await authorizationHeader())
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogAtEnd = await helper.bloglistsInDb()
        expect(blogAtEnd).toHaveLength(blogAtStart.length + 1)

        const titles = blogAtEnd.map(b => b.title)
        expect(titles).toContain('abc')
    })

    test('likes missing, default value is 0', async () => {
        const newBlog = {
            title: "like missing count",
            author: "yiyimeow",
            url: "google.com"
        }

        const blog = await api
            .post("/api/blogs")
            .set(await authorizationHeader())
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(blog.body.likes).toBe(0)
    })

    test('fails with statuscode 400 if missing title or url', async () => {
        const newBlog = {
            author: "yiyi"
        }

        await api
            .post('/api/blogs')
            .set(await authorizationHeader())
            .send(newBlog)
            .expect(400)
    })

    test('fail if not providing token while creating note', async () => {
        const newBlog = {
            title: "abc",
            author: "yiyi",
            url: "google.com"
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })

    test('Update with valid data', async () => {
        const newBlog = {
            title: "Initialize",
            author: "update",
            url: "update.com"
        }

        const blog = await api
            .post('/api/blogs')
            .set(await authorizationHeader())
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const id = blog.body.id

        await api
            .put(`/api/blogs/${id}`)
            .set(await authorizationHeader())
            .send({
                title: "Updated"
            })
            .expect(204)

        const blogUpdated = await Bloglist.findById(id)
        expect(blogUpdated.title).toBe("Updated")
    })

    test('fail with status code 401 if updating with no authorization header', async () => {
        const newBlog = {
            title: "Initialize",
            author: "update",
            url: "update.com"
        }

        const blog = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const id = blog.body.id

        await api
            .put(`/api/blogs/${id}`)
            .send({
                title: "Updated"
            })
            .expect(401)
    })
})

describe('fetching blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('verify unique identifier - id', async () => {
        const blog = await helper.bloglistsInDb()
        const blogToCheck = blog[0]

        expect(blogToCheck.id).toBeDefined()
    })
});

describe('Deleting Blog', () => {
    test('Blog owner deleted a blog with valid id', async () => {
        const newBlog = await api
            .post('/api/blogs')
            .send({
                'title': 'To be deleted',
                'author': 'Unknown',
                'url': 'delete'
            })
            .set(await authorizationHeader())

        const blogsAtStart = await helper.bloglistsInDb()
        const blogToDelete = newBlog.body.id

        await api
            .delete(`/api/blogs/${blogToDelete}`)
            .set(await authorizationHeader())
            .expect(204)

        const blogsAtEnd = await helper.bloglistsInDb()

        expect(blogsAtEnd).toHaveLength(
            blogsAtStart.length - 1
        )

        const blogs = blogsAtEnd.map(b => b.id)

        expect(blogs).not.toContain(blogToDelete.id)
    })

    test('fails with statuscode 401 if not a owner', async () => {
        // Login the non owner and get token
        const loginUser = await api
            .post('/api/login')
            .send({
                username: "test",
                password: "test"
            })

        let token = {
            Authorization: `Bearer ${loginUser.body.token}`
        }

        // Create a new blog with owner "temp"
        const newBlog = await api
            .post('/api/blogs')
            .send({
                'title': 'To be deleted',
                'author': 'Unknown',
                'url': 'delete'
            })
            .set(await authorizationHeader())

        const blogToDelete = newBlog.body.id

        await api
            .delete(`/api/blogs/${blogToDelete}`)
            .set(token)
            .expect(401)
    })

    test('fails with statuscode 400 if its an invalid id', async () => {
        const id = await helper.nonExistingId()

        await api
            .delete(`/api/blogs/${id}`)
            .set(await authorizationHeader())
            .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})