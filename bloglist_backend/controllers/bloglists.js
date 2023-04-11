const bloglistsRouter = require('express').Router()
const Bloglist = require('../models/bloglist')
const userExtractor = require('../utils/middleware').userExtractor

bloglistsRouter.get('/', async (request, response) => {
    const blogs = await Bloglist
        .find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs)
})

bloglistsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body

    if (body.title === undefined || body.author === undefined ||
        body.url === undefined) {
        return response.status(400).json({
            error: "Missing info"
        })
    }

    const user = request.user

    const blog = new Bloglist({
        title: body.title,
        author: body.author,
        url: body.url,
        user: user.id,
        likes: body.likes || 0
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

bloglistsRouter.put('/:id', userExtractor, async (request, response) => {
    const { title, author, url, likes } = request.body
    const id = request.params.id

    const user = request.user
    const blogToUpdate = await Bloglist.findById(id)
    const userOfBlog = blogToUpdate.user._id.toString()

    if (user.id === userOfBlog) {
        const updatedBlog = await Bloglist.findByIdAndUpdate(
            request.params.id, { title, author, url, likes },
            { new: true, runValidators: true, context: 'query' }
        )

        response.status(204).json(updatedBlog)
    } else {
        return response.status(401).json({
            error: "You are not the owner!"
        })
    }
})

bloglistsRouter.delete('/:id', userExtractor, async (request, response) => {
    const blogId = request.params.id

    if (blogId === undefined) {
        return response.status(400).json({
            error: "Missing id"
        })
    }

    const user = request.user

    const blogToDelete = await Bloglist.findById(blogId)

    if (!blogToDelete) {
        return response.status(400).json({
            error: "Invalid id"
        })
    }

    const userOfBlog = blogToDelete.user._id.toString()

    if (user.id === userOfBlog) {
        await Bloglist.findByIdAndRemove(blogId)
    } else {
        return response.status(401).json({
            error: "You are not the owner!"
        })
    }

    response.status(204).end()
})

module.exports = bloglistsRouter