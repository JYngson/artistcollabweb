# Spotify Collab Web Prototype

## Tech Stack -
Javascript, TypeScript, React, Next.js, Tailwind, Three.js, React Three Drei, React Three Fiber, Express, Axios

## Project Goal Summary -
Development of a web application which maps out artist collaborations between musicians using the Spotify API.

## Project Description -
This web application utilizes the Spotify API in conjunction with React, Next.js, Three.js, React Three Drei, and React Three Fiber to create a 2D and 3D representation of a given artist's album collaborations with other artists. Each artist's 2D page displays their albums, collaborations, collaboration count per collaborator, as well as follower count and popularity out of 100 (based on Spotify's criteria). Each artist's 3D page renders a 3D coin in the middle with their profile picture, and populates the 3D plane with one coin per collaborator with their size corresponding to the number of collaborations a collaborator has with a given artist.

## Limitations - 

1. As previously mentioned, the app's current build only displays an artist's collaborator count based on their ALBUMS. Singles are not included in this count.

2. The current Next.js 13 build uses the prototype 'app' file structure which - at the time of writing - is unable to run the next export command needed for Netlify to host the site. As such, a demo video is provided at the bottom should you be interested in seeing this project in action. My hope is that as Next 13 matures, I will be able to host the site at a later date.

3. As the Spotify API requires a client secret to access the authentication service, cloning and attempting to run this project will not work. A placeholder env is kept in this file to signify this limitation, but for security purposes (and good practice), I will not be sharing this client secret.


### Video Link (Mar 15, 2023):
https://youtu.be/Y1xqPCBErgU

### My Portfolio Site:
https://master--glittery-froyo-fc1b7e.netlify.app/

### My LinkedIn:
https://www.linkedin.com/in/jamesyngson/