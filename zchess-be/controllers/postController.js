const Post = require("../models/Post");
exports.getPosts = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .populate("author", "fullName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Total count for pagination
    const count = await Post.countDocuments(query);

    res.json({
        posts,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post by slug or ID
exports.getPost = async (req, res) => {
    try {
        const { id } = req.params;
        let post;
        
        // Check if id is ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
             post = await Post.findById(id).populate("author", "fullName");
        } else {
             post = await Post.findOne({ slug: id }).populate("author", "fullName");
        }

        if (!post) return res.status(404).json({ message: "Post not found" });
        
        // Increment views
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, slug, content, summary, thumbnail, category, tags, isPublished } = req.body;
    
    const post = new Post({
      title,
      slug,
      content,
      summary,
      thumbnail,
      author: req.user._id,
      category,
      tags,
      isPublished: isPublished || false
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }
      res.json({ message: "Post deleted" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
