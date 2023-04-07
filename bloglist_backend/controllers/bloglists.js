const bloglistsRouter = require('express').Router()
const Bloglist = require('../models/bloglist')

bloglistsRouter.get('/', async (request, response) => {
    const blogs = await Bloglist.find({})
    response.json(blogs)
})

bloglistsRouter.post('/', async (request, response) => {
    const body = request.body

    if (body.title === undefined || body.author === undefined ||
        body.url === undefined) {
        return response.status(400).json({
            error: "Missing info"
        })
    }

    const blog = new Bloglist({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
    })

    const savedBlog = await blog.save()

    response.status(201).json(savedBlog)
})

bloglistsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body

    const updatedBlog = await Bloglist.findByIdAndUpdate(
        request.params.id, { title, author, url, likes },
        { new: true, runValidators: true, context: 'query' }
    )

    response.status(204).json(updatedBlog)
})

bloglistsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id

    if (id === undefined) {
        return response.status(400).json({
            error: "Missing id"
        })
    }

    await Bloglist.findByIdAndRemove(id)

    response.status(204).end()
})

module.exports = bloglistsRouter