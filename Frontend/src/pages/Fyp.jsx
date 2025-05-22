import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import SideBar from '../../components/SideBar';

export default function Fyp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [chosenPost, setChosenPost] = useState(null);
  const [newComment, setNewComment] = useState("");
    
  useEffect(() => {
    const getFriendsPosts = async() => {
      try {
        setLoading(true);
        const res = await fetch("/backend/posts/posts");
        const data = await res.json();
        if(!res.ok){
          setLoading(false);
          setError(data.message);
          return;
        }
        setPosts(data.posts);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message);
      }
    };
    getFriendsPosts();
  },[]);

  const handleLike = async (postId) => {
    setLoading(true);
    try {
      const res = await fetch("/backend/posts/upvote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, upvotes: data.upvotes }
            : post
        )
      );

      setLikedPosts((prevLiked) => {
        const newLiked = new Set(prevLiked);
        if (newLiked.has(postId)) {
          newLiked.delete(postId);
        } else {
          newLiked.add(postId);
        }
        return newLiked;
      });

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch("/backend/posts/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch comments");
      }

      setComments((prev) => ({
        ...prev,
        [postId]: data,
      }));
      
      setChosenPost(postId === chosenPost ? null : postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
  
    const tempComment = {
      _id: Math.random().toString(36).substring(7),
      content: newComment,
    };
  
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment],
    }));
  
    setNewComment("");

    try {
      const res = await fetch('/backend/comments/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: newComment }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.comment) {
        setError(data.message);
        return;
      }
      
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []).filter(c => c._id !== tempComment._id), data.comment],
      }));

    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async(commentId) => {    
    setLoading(true);
    try {
      const res = await fetch("/backend/comments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
  
      setComments(prevComments => ({
        ...prevComments,
        [chosenPost]: prevComments[chosenPost].filter(comment => comment._id !== commentId)
      }));
      
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-light tracking-widest uppercase mb-8">For You</h1>
          
          {loading && posts.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-white/50 text-center">No posts available. Follow more friends to see their updates.</p>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {posts.map(post => (
                  <motion.div 
                    key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-white/10 p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-center mb-4">
                      {post.user?.avatar && (
                        <img 
                          src={post.user.avatar} 
                          alt={post.user.username} 
                          className="w-8 h-8 rounded-full mr-3 border border-white/20"
                        />
                      )}
                      <span className="font-light">{post.user?.username || "Anonymous"}</span>
                    </div>
                    
                    {/* Post Content */}
                    <p className="text-sm mb-4">{post.content}</p>
                    
                    {/* Post Actions */}
                    <div className="flex items-center justify-between text-xs text-white/50 mt-6">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center gap-1 transition-colors duration-300 ${
                            likedPosts.has(post._id) ? 'text-white' : 'text-white/50 hover:text-white'
                          }`}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="w-4 h-4"
                          >
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                          <span>{post.upvotes || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => fetchComments(post._id)}
                          className="flex items-center gap-1 text-white/50 hover:text-white transition-colors duration-300"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="w-4 h-4"
                          >
                            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                          </svg>
                          <span>
                            {comments[post._id] ? 'Hide Comments' : 'Comment'}
                          </span>
                        </button>
                      </div>
                      
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Comments Section */}
                    <AnimatePresence>
                      {chosenPost === post._id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-4 border-t border-white/10"
                        >
                          {/* Add Comment */}
                          <div className="flex items-center gap-2 mb-4">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 p-2 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              disabled={!newComment.trim()}
                              className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                            >
                              Post
                            </button>
                          </div>
                          
                          {/* Comments List */}
                          {comments[post._id] && comments[post._id].length > 0 ? (
                            <div className="space-y-3">
                              {comments[post._id].map(comment => (
                                <div key={comment._id} className="flex justify-between items-start bg-white/5 p-3">
                                  <div>
                                    <p className="text-xs font-light">{comment.content}</p>
                                    <p className="text-xs text-white/50 mt-1">
                                      {comment.user?.username || "Anonymous"} • {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  
                                  {comment.isAuthor && (
                                    <button 
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="text-xs text-white/50 hover:text-white transition-colors duration-300"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/50 text-xs">No comments yet. Be the first to comment!</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}