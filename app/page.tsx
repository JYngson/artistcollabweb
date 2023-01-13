"use client"
//Change use client later when creating login route

export default function HomePage() {
  const axios = require('axios');

  const redirect = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    axios.get('http://localhost:8080/auth')
    .then((res:any) => {
      window.location.assign(res.request.responseURL)
    })
    .catch((err:any) => {
      console.log(err)
    })
  }

  return (
    <div id="HomePage" className='w-screen h-screen bg-zinc-300'>
      <div id="Card" className="w-1/6 h-3/6 flex flex-col justify-center items-center bg-blue-300">
        <h1>Card</h1>
        <h2>Artist Name</h2>
        <p>Albums</p>
      </div>
      <button onClick={redirect}>Click Here</button>
    </div> 
  )
}
