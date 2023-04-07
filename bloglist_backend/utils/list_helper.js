const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, curr) => {
        return acc + curr.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    const most_liked_person = blogs.reduce((acc, curr) => {
        return curr.likes > acc.likes ? curr : acc
    })

    return {
        author: most_liked_person.author,
        likes: most_liked_person.likes,
        title: most_liked_person.title
    }
}

const mostBlogs = (blogs) => {
    blogs_num = new Map()

    blogs.map(blog => {
        if (blogs_num.has(blog.author)) {
            blogs_num.set(blog.author, blogs_num.get(blog.author) + 1)
        }
        else {
            blogs_num.set(blog.author, 1)
        }
    })

    const person_with_most_blogs =
        [...blogs_num.keys()].reduce((a, b) =>
            blogs_num.get(a) > blogs_num.get(b) ? a : b
        )

    return {
        author: person_with_most_blogs,
        blogs: blogs_num.get(person_with_most_blogs)
    }
}

const mostLikes = (blogs) => {
    author_likes = new Map()

    blogs.map(blog => {
        if (author_likes.has(blog.author)) {
            author_likes.set(blog.author, author_likes.get(blog.author) + blog.likes)
        }
        else {
            author_likes.set(blog.author, blog.likes)
        }
    })

    const person_with_most_likes
        = [...author_likes.keys()].reduce((a, b) =>
            author_likes.get(a) > author_likes.get(b) ? a : b)

    return ({
        author: person_with_most_likes,
        likes: author_likes.get(person_with_most_likes)
    })
}


module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}