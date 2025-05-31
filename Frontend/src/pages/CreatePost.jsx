import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SideBar from '../components/SideBar';
import { API_CALL_PREFIX } from '../../config.js';

export default function CreatePost() {

  const initialFormData = {
    content: "",
  }

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log(loading, error);
  const token = localStorage.getItem("token");
  const [myPosts, setMyPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [chosenPost, setChosenPost] = useState(null);
  const [showForm, setShowForm] = useState(() => {
      const saved = localStorage.getItem("showForm");
      return saved !== null ? JSON.parse(saved) : true;
    }); 
  const [showPosts, setShowPosts] = useState(() => {
      const saved = localStorage.getItem("showPosts");
      return saved !== null ? JSON.parse(saved) : false;
    });
  const [addingPost, setAddingPost] = useState(() => {
      const saved = localStorage.getItem("editMode");
      return saved === "true" ? false : true;
    });
  const [updatingPost, setUpdatingPost] = useState(() => {
      const saved = localStorage.getItem("editMode");
      return saved === "true";
    }); 
  const [updateMe, setUpdateMe] = useState(() => {
      const saved = localStorage.getItem("editPost");
      return saved ? JSON.parse(saved) : null;
    });

  useEffect(() => {
      localStorage.setItem("showForm", JSON.stringify(showForm));
      localStorage.setItem("showPosts", JSON.stringify(showPosts));
    }, [showForm, showPosts]);
  

  useEffect(()=>{
    const getMyPosts = async()=>{
      setLoading(true);
      try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/posts`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
        const data = await res.json();
        if(!res.ok){
          setLoading(false);
          setError(data.message);
          return;
        }
        setMyPosts(data.posts);
        setLoading(false);
        setError(null);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    getMyPosts();
  },[])


  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }
  
  
  const createDaPost = async(e)=>{
    e.preventDefault();
    setLoading(true);
    try {
      console.log(formData.content);
      const res = await fetch(`${API_CALL_PREFIX}/backend/posts/create`,{
        method : "POST",
            headers:{
                'Content-Type' : 'application/json','Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
      })
      const data = await res.json();
      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      }

      const updatedPostsRes = await fetch(`${API_CALL_PREFIX}/backend/posts/`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
      const updatedPostsData = await updatedPostsRes.json();

      if(updatedPostsRes.ok){
        setMyPosts(updatedPostsData.posts);
      }
      setError(null);
      setLoading(false);
      setSuccessMessage("Post created successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }


  const fetchComments = async (postId) => {
    try {
        const res = await fetch(`${API_CALL_PREFIX}/backend/posts/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          setError(data.message);
          return;
            // throw new Error(data.message || "Failed to fetch comments");
        }

        setComments((prev) => ({
            ...prev,
            [postId]: data, 
        }));
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
  };


  const handleDeleteComment = async(commentId)=>{
    setLoading(true);
    try {
      const res = await fetch(`${API_CALL_PREFIX}/backend/comments/delete`,{
        method : "POST",
        headers:{
          'Content-Type' : 'application/json','Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({commentId}),
      });
      const data = await res.json();

      if(!res.ok){
        setError(data.message);
        setLoading(false);
        return;
      }

      setComments(prevComments=>({
        ...prevComments, 
        [chosenPost]: prevComments[chosenPost].filter(comment=> comment._id !== commentId),
      }));
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  const handleDeletePost = async(postId)=>{
    setLoading(true);
    try {
      const res = await fetch(`${API_CALL_PREFIX}/backend/posts/delete`,{
        method : "POST",
        headers:{
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({postId}),
      });
      const data = await res.json();

      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      };

      setMyPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setMyPosts(prevPosts => {
        const updatedPosts = prevPosts.filter(post => post._id !== postId);
      
        // If no goals left, switch to add habit form
        if (updatedPosts.length === 0) {
          setShowForm(true);
          setShowPosts(false);
          setAddingPost(true);
          setUpdatingPost(false);
          setUpdateMe(null);
          setFormData(initialFormData);
      
          localStorage.setItem("showForm", "true");
          localStorage.setItem("showPosts", "false");
          localStorage.removeItem("editMode");
          localStorage.removeItem("editPost");
        }
        return updatedPosts;
      })
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const updatePost = async(e)=>{
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        postId: updateMe._id,
        content: formData.content || updateMe.content,
      };

      const res = await fetch(`${API_CALL_PREFIX}/backend/posts/update`,{
        method : "POST",
        headers:{
          'Content-Type': 'application/json','Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if(!res.ok){
        setLoading(false);
        setError(data.message)
        return;
      };

      const updatedPostsRes = await fetch(`${API_CALL_PREFIX}/backend/posts`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
      const updatedPostsData = await updatedPostsRes.json();

      if(!updatedPostsRes.ok){
        setLoading(false);
        setError(updatedPostsData.message);
        return;
      };

      setMyPosts(updatedPostsData.posts);
      setLoading(false);
      setError(null);
      setShowForm(!showForm);
      setShowPosts(!showPosts);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }
  return (
    <div className='flex min-h-screen bg-bg text-text-primary font-serif'>
      <SideBar/>
      <div className='flex-1 min-h-full pt-0 pb-0 p-4 md:p-8 overflow-y-auto'>
        <div className='flex flex-col max-w-4xl mx-auto'>
        {addingPost && showForm && <p className='text-center my-6 text-3xl font-semibold text-primary'>Create New Post</p>}
        {updatingPost && showForm && <p className='text-center my-6 text-3xl font-semibold text-primary'>Edit Post</p>}
          {showForm && (<form className='flex flex-col p-6 items-center justify-center gap-5 border border-secondary m-2 rounded-xl bg-bg shadow-md' onSubmit={addingPost ? createDaPost : updatePost}>
              <textarea rows="4" 
                placeholder={addingPost ? "What's on your mind..." : updateMe?.content || ''} name='content' id='content' onChange={handleChange} value={formData.content} className="w-full p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm" required/>
              
              <button className='bg-primary hover:bg-accent text-bg rounded-lg p-3 w-48 transition-colors disabled:opacity-50 shadow-md'>{addingPost ? 'Create Post' : 'Update Post'}</button>
                {successMessage && (
                <p className='text-green-600 font-medium mt-2 text-sm'>{successMessage}</p>
                )}
                {updatingPost && <button type="button" className='bg-secondary hover:bg-opacity-80 text-bg rounded-lg p-3 w-48 transition-colors mt-1 shadow-md'
                onClick={()=>{
                  setAddingPost(true);
                  setUpdatingPost(false);
                  setUpdateMe(null);
                  setFormData(initialFormData);
                  localStorage.removeItem("editMode");
                  localStorage.removeItem("editPost");
                }}>
                  Cancel Update</button>}
            </form>)}

            {(addingPost || showPosts)&&(
          <div className={`flex ${!showPosts || !myPosts || myPosts.length === 0 ? "justify-center" : "justify-end"} mt-6 mb-4`}>
            <button 
              className={`p-3 w-auto min-w-[180px] rounded-lg text-bg transition-colors shadow-md ${showPosts ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:bg-opacity-80"} ${(!showPosts && (!myPosts || myPosts.length === 0)) ? "opacity-50 cursor-not-allowed" : ""}`} 
              onClick={() => {
                setShowForm(!showForm);
                setShowPosts(!showPosts);
                setFormData(initialFormData);
                setAddingPost(true);
                setUpdatingPost(null);
                setSuccessMessage('');
                setError(null);
              }}
              disabled = {(!showPosts && (!myPosts || myPosts.length === 0))}
            >
              {showPosts ? "Hide My Posts" : "Show My Posts"}
            </button>
          </div>
        )}
         {showPosts && (!myPosts || myPosts.length === 0) && (
            <p className='text-center text-text-muted mt-10'>You haven&apos;t created any posts yet.</p>
        )}

            {showPosts && myPosts && myPosts.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
              { 
                myPosts.map((post)=>(
                  <div key={post._id}
                  className={`relative flex bg-bg border border-secondary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-2 ${chosenPost === post._id ? "md:col-span-2 flex-col md:flex-row" : "flex-col"}`}>
                  <div className={`p-4 ${chosenPost === post._id ? "w-full md:w-1/2" : "w-full"}`}>
                    <div className='p-1'>
                      <div className='flex justify-between items-center mb-3'>
                        <div className='flex flex-row items-center gap-2'>
                          <img src={post.user.avatar} className='h-9 w-9 rounded-full object-cover border border-secondary' alt="Avatar" />
                          <p className='font-medium text-text-primary hover:underline cursor-pointer'>{post.user.username}</p>
                        </div>

                        <div className='flex items-center gap-3'>
                          <button className="focus:outline-none flex items-center gap-1">
                            <FontAwesomeIcon icon={faHeart} className={`text-xl cursor-pointer transition-colors duration-300 ${post.upvotes > 0 ? "text-red-500" : "text-text-muted hover:text-red-400"}`} />
                            <span className="text-text-muted font-semibold text-sm">{post.upvotes}</span>
                          </button>
                          <button className="text-red-500 hover:text-red-700 focus:outline-none" onClick={()=>handleDeletePost(post._id)}>
                                <i className="fas fa-trash text-sm"></i> 
                              </button>
                        </div>
                      </div>

                      <div className='text-text-primary p-3 mt-2 border border-secondary/50 rounded-lg bg-bg shadow-inner text-sm min-h-[60px]'>
                        {post.content}
                      </div>

                      <div className='flex justify-evenly gap-3 items-center mt-4 pt-3 border-t border-secondary/50'>
                    <button className='mt-2 w-full px-4 py-2 bg-accent hover:opacity-90 text-bg rounded-lg text-sm shadow-sm' 
                      onClick={() => {
                        setShowForm(true); 
                        setShowPosts(false);
                        setAddingPost(false);
                        setUpdatingPost(true);
                        setUpdateMe(post);
                        setFormData({ content: post.content });
                        localStorage.setItem("editMode", "true");
                        localStorage.setItem("editPost", JSON.stringify(post));
                        localStorage.setItem("showForm", "true");
                        localStorage.setItem("showPosts", "false");
                      }}>
                      Update Post
                    </button>
                    
                      <button 
                        onClick={() => {
                          if (post._id !== chosenPost) {
                            fetchComments(post._id); 
                          }
                          setChosenPost(post._id === chosenPost ? null : post._id);
                        }}
                        className="mt-2 w-full px-4 py-2 bg-secondary hover:opacity-90 text-bg rounded-lg text-sm shadow-sm"
                      >
                        {chosenPost === post._id ? "Hide Comments" : "View Comments"}
                      </button>
                  </div>
                    </div>
                  </div>

                  {chosenPost === post._id && (
                    <div className="w-full md:w-1/2 p-4 border-l border-secondary/50 bg-bg text-text-primary rounded-r-xl transition-all duration-300 flex flex-col">
                      <h3 className='text-lg font-semibold text-primary mb-3 pb-2 border-b border-secondary/50'>Comments</h3>
                      <div className='flex-grow h-60 overflow-y-auto bg-bg p-3 rounded-lg border border-secondary/30 shadow-inner space-y-2'>
                        {comments[post._id] && comments[post._id].length > 0 ? (
                          comments[post._id].map((comment, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 border border-secondary/20 rounded-md bg-bg shadow-sm">
                              <p className='text-text-primary text-sm'>{comment.content || "No content available"}</p>
                              <button className="text-red-500 hover:text-red-700 focus:outline-none" onClick={()=>handleDeleteComment(comment._id)}>
                                <i className="fas fa-trash text-xs"></i> 
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className='text-text-muted text-center py-4 text-sm'>No comments yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
        </div>
      </div>
    </div>
  )
}