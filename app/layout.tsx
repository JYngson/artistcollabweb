import '../styles/globals.css';

export default function RootLayout({children}: {children: React.ReactNode}) {

  return (
    <html style={{scrollbarWidth:'none'}}>
      <head/>
      <body className='h-screen, max-w-screen'>
        {children}
      </body>
    </html>
  )
}
