import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart, faL } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SideBar from '../../components/SideBar';

export default function CreatePost() {

  const initialFormData = {
    content: "",
  }

  const [formData, setFormData] = useState(initialFormData);
  const currentUser = useSelector(state=> state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [chosenPost, setChosenPost] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showPosts, setShowPosts] = useState(false);
  const [addingPost, setAddingPost] = useState(true);
  const [updatingPost, setUpdatingPost] = useState(null);
  const [updateMe, setUpdateMe] = useState(null);



  useEffect(()=>{
    const getMyPosts = async()=>{
      setLoading(true);
      try {
        const res = await fetch("/backend/posts");
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
      const res = await fetch("/backend/posts/create",{
        method : "POST",
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),
      })
      const data = await res.json();
      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      }
      setError(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }


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
      const res = await fetch("/backend/comments/delete",{
        method : "POST",
        headers:{
          'Content-Type' : 'application/json',
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
      const res = await fetch("/backend/posts/delete",{
        method : "POST",
        headers:{
          'Content-Type': 'application/json',
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

      const res = await fetch("/backend/posts/update",{
        method : "POST",
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if(!res.ok){
        setLoading(false);
        setError(data.message)
        return;
      };

      const updatedPostsRes = await fetch("/backend/posts");
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

  if(updateMe){
    console.log(updateMe._id);
    console.log(updateMe.content);
  }
  

  return (
    <div className='flex  min-h-screen  bg-gray-800'>
      <SideBar/>
      <div className='border border-red-800 flex-1 min-h-full pt-0 pb-0 p-4'>
        <div className='flex flex-col'>
        {addingPost && showForm && <p className='text-center mt-2 text-3xl font-bold italic'>Add Post</p>}
        {updatingPost && showForm && <p className='text-center mt-2 text-3xl font-bold italic'>Edit Post</p>}



          {showForm && (<form className='flex flex-col p-8 items-center justify-center gap-4 border m-2 rounded-2xl' onSubmit={addingPost ? createDaPost : updatePost}>
              <textarea rows="3" 
                placeholder={addingPost ? "What's on your mind" : updateMe?.content || ''} name='content' id='content' onChange={handleChange} value={formData.content} className="w-full p-2 mt-1 text-black border rounded-2xl text-center"/>
              

              <button className='bg-green-600 text-white rounded-2xl p-2 w-40'>{addingPost ? 'Create' : 'Update'}</button>
                {updatingPost && <button className='bg-red-600 text-white rounded-2xl p-2 w-40'
                onClick={()=>{
                  setAddingPost(!addingPost);
                  setUpdatingPost(!updatingPost);
                  setFormData(initialFormData);
                }}>
                  Cancel</button>}
            </form>)}
            {/* <p>Just checking if the layout is like how I expect it to be</p> */}


            {(addingPost || showPosts)&&(
          <div className={`flex ${!showPosts ? "justify-center" : "justify-start"} mt-4`}>
            <button 
              className={`p-2 w-40 rounded-2xl text-white ${showPosts ? "bg-red-600 ml-4" : "bg-blue-600"} `} 
              onClick={() => {
                setShowForm(!showForm);
                setShowPosts(!showPosts);
                setFormData(initialFormData);
                setAddingPost(true);
                setUpdatingPost(null);
              }}
            >
              {showPosts ? "Hide Posts" : "Show Posts"}
            </button>
          </div>
        )}


            {showPosts && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4'>
              {myPosts.length > 0 && 
                myPosts.map((post)=>(
                  <div key={post._id}
                  className={`relative flex bg-slate-500 border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 p-4  ${chosenPost === post._id ? "sm:col-span-2 flex-row" : "flex-col"}`}>
                  <div className={`p-4 ${chosenPost === post._id ? "w-full sm:w-1/2" : "w-full"}`}>
                    <div className='p-4'>
                      <div className='flex justify-between items-center'>
                        <div className='flex flex-row items-center gap-2'>
                          <img src={post.user.avatar} className='h-7 w-7 rounded-full' alt="Avatar" />
                          <p className='font-medium italic underline'>{post.user.username}</p>
                        </div>

                        <div className='flex items-center gap-2'>
                          <button className="focus:outline-none">
                            <FontAwesomeIcon icon={faHeart} className={`text-xl cursor-pointer transition-colors duration-300 ${post.upvotes > 0 ? "text-red-500" : "text-white"}`} />
                          </button>
                          <span className="text-white font-semibold">{post.upvotes}</span>
                          <button className="text-red-500 hover:text-red-700" onClick={()=>handleDeletePost(post._id)}>
                                <i className="fas fa-trash"></i> 
                              </button>
                        </div>
                      </div>

                      <div className='text-center p-2 mt-2 border border-gray-800 rounded-lg'>
                        {post.content}
                      </div>



                      <div className='flex  justify-evenly gap-4 items-center mt-3'>
                    <button className='mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md text-center' 
                      onClick={() => {
                        setShowForm(true); 
                        setShowPosts(false);
                        setAddingPost(!addingPost);
                        setUpdatingPost(!updatingPost);
                        setUpdateMe(post);
                      }}>
                      Update
                    </button>
                    
                      <button 
                        onClick={() => {
                          if (post._id !== chosenPost) {
                            fetchComments(post._id); 
                          }
                          setChosenPost(post._id === chosenPost ? null : post._id);
                        }}
                        className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md text-center"
                      >
                        {chosenPost === post._id ? "Close Comments" : "View Comments"}
                      </button>
                  </div>
                    </div>
                  </div>

                  {chosenPost === post._id && (
                    <div className="w-full sm:w-1/2 p-4 border border-gray-500 bg-gray-700 text-white rounded-lg transition-all duration-300 flex flex-col">
                      <h3 className='text-lg font-semibold mb-2'>Comments</h3>
                      <div className='h-60 overflow-y-auto bg-gray-800 p-2 rounded-lg'>
                        {comments[post._id] && comments[post._id].length > 0 ? (
                          comments[post._id].map((comment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b">
                              <p className='text-white'>{comment.content || "No content available"}</p>
                              <button className="text-red-500 hover:text-red-700" onClick={()=>handleDeleteComment(comment._id)}>
                                <i className="fas fa-trash"></i> 
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className='text-gray-400'>No comments yet.</p>
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