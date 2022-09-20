import { useEffect, useState } from 'react';
import './App.css';
import Chat from './Chat/Chat';

function App() {
  const [loggedUser, setLoggedUser] = useState();
  const [randomImgUrl, setRandomImgUrl] = useState();

  useEffect(() => {
    fetchImg();
  }, []);

  useEffect(() => {
    if (randomImgUrl) {
      let personNickname;
      do {
        personNickname = prompt('Chachooo dime tu nombrecico por favor...');
      } while (personNickname === null || personNickname === '');
      setLoggedUser({ nickname: personNickname, photo: randomImgUrl });
    }
  }, [randomImgUrl]);

  const fetchImg = async () => {
    const res = await fetch('https://picsum.photos/30');
    if (res.url) {
      setRandomImgUrl(res.url);
    }
  };

  return (
    <div className="App">
      {loggedUser && randomImgUrl ? (
        <Chat loggedUser={loggedUser} />
      ) : (
        <h4>Loading...</h4>
      )}
    </div>
  );
}

export default App;
