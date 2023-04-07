const Bloglist = require('../models/bloglist')

const initialBloglists = [
    {
        title: "1",
        author: "yiyi",
        url: "google.com",
        likes: 0
    },
    {
        title: "2",
        author: "yiyimeow",
        url: "google.com",
        likes: 0
    },
]

const nonExistingId = async () => {
    const blog = new Bloglist({
        title: "non valid",
        author: "unknown",
        url: "none"
    })

    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const bloglistsInDb = async () => {
    const bloglists = await Bloglist.find({})
    return bloglists.map(b => b.toJSON())
}

module.exports = {
    initialBloglists, nonExistingId, bloglistsInDb
}