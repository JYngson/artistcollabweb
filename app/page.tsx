'use client'
//Change use client later when creating login route
import { useEffect, useState } from 'react';

export default function HomePage() {
  const axios = require('axios');
  const currentURL = window.location.search;
  const searchParams = new URLSearchParams(currentURL);

  let [code, setCode] = useState<String | null>()

  const redirect = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    axios.get('http://localhost:8080/token')
    .then((res:any) => {
      window.location.assign(res.request.responseURL);
    })
    .catch((err:any) => {
      console.log(err);
    })
  }

  function authCheck(){
    if (searchParams.has('code')){
      let getCode = searchParams.get('code');
      setCode(getCode);
    }

    if (searchParams.has('error')){
      let error = searchParams.get('error');
      console.log(error);
    }
  }


  function authentication(){
    axios.get('/auth',{
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:3000',
    })
    .then((res:any) => {
      console.log(res);
    })
    .catch((err:any) => {
      console.log(err);
    })
  }

  useEffect(() => {
    authCheck();

    if (code){
      authentication();
    }

  }, [])

  return (
    <div id='HomePage' className='w-screen h-screen bg-zinc-300'>
      <div id='Card' className='w-1/6 h-3/6 flex flex-col justify-center items-center bg-blue-300'>
        <h1>Card</h1>
        <h2>Artist Name</h2>
        <p>Albums</p>
      </div>
      <button onClick={redirect}>Click Here</button>
    </div> 
  )
}
