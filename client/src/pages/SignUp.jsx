import React, { useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

const SignUp = () => {

  const [formData , setFormData ] = useState({});
  const [error , setError ] = useState(null);
  const [loading , setLoading ] = useState(false);
  const navigate = useNavigate();
  const handelChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id] : e.target.value ,
      
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
 const res = await fetch("api/auth/signup",
      {
        method: 'POST',
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify(formData),
    }
    );

      const data = await res.json();
      
    if (data.success === false) {
      setLoading(false);
      setError(data.message);
      
      return;
    }
      setLoading(false);
      setError(null);
      navigate("/sign-in");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
   

  }
 
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'> Sign Up  </h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 ' >
        <input type="text" id='username' placeholder='Username'
          className='border p-3 rounded-lg' onChange={handelChange} />
        <input type="email" id='email' placeholder='Email'
          className='border p-3 rounded-lg' onChange={handelChange} />
        <input type="password" id='password' placeholder='Password'
          className='border p-3 rounded-lg' onChange={handelChange} />
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? "Loading" : "Sign Up"} </button>
          <OAuth />
      </form>
      <div className='flex flex-row gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {error &&  <p className='text-red-500 mt-5'> {error} </p>}
    </div>
  )
}

export default SignUp;
