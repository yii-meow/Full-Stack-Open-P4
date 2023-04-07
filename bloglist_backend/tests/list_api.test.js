const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Bloglist = require('../models/bloglist')

beforeEach(async () => {
    await Bloglist.deleteMany({})

    for (let bloglist of helper.initialBloglists) {
        let bloglistObject = new Bloglist(bloglist)
        await bloglistObject.save()
    }
})

describe('fetching blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const blogs = await api.get('/api/blogs')

        expect(blogs.body).toHaveLength(helper.initialBloglists.length)
    })

    test('verify unique identifier - id', async () => {
        const blog = await helper.bloglistsInDb()
        const blogToCheck = blog[0]

        expect(blogToCheck["id"]).toBeDefined()
    })
});

describe('saving or updating new blogs', () => {
    test('success saving blog with valid data', async () => {
        const newBlog = {
            title: "abc",
            author: "yiyi",
            url: "google.com"
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogAtEnd = await helper.bloglistsInDb()
        expect(blogAtEnd).toHaveLength(helper.initialBloglists.length + 1)

        const titles = blogAtEnd.map(b => b.title)
        expect(titles).toContain('abc')
    })

    test('likes missing, default value is 0', async () => {
        const newBlog = {
            title: "like missing count",
            author: "yiyimeow",
            url: "google.com"
        }

        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogs = await helper.bloglistsInDb()
        const blogToCheck = blogs[helper.initialBloglists.length]

        expect(blogToCheck["likes"]).toBe(0)
    })

    test('fails with statuscode 400 if missing title or url', async () => {
        const newBlog = {
            author: "yiyi"
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
    })

    test('success updating with valid data', async () => {
        const blogs = await helper.bloglistsInDb()
        const blogToUpdate = blogs[0]

        const blog = {
            title: "Try Updating",
            author: "Rowling",
            url: "google.com"
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blog)
            .expect(204)

        const blogsAtEnd = await helper.bloglistsInDb()
        const blogsToCheck = blogsAtEnd[0]

        expect({
            title: blogsToCheck.title,
            author: blogsToCheck.author,
            url: blogsToCheck.url,
            likes: blogsToCheck.likes
        }).toEqual({
            title: "Try Updating",
            author: "Rowling",
            url: "google.com",
            likes: 0
        })
    })
})

describe('Deleting Blog', () => {
    test('successfully deleted a blog with valid id', async () => {
        const blogsAtStart = await helper.bloglistsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.bloglistsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBloglists.length - 1
        )

        const blogs = blogsAtEnd.map(b => b.id)

        expect(blogs).not.toContain(blogToDelete.id)
    })

    test('fails with statuscode 400 if its a invalid id', async () => {
        const id = await helper.nonExistingId()

        await api
            .delete(`/api/blogs/id`)
            .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})