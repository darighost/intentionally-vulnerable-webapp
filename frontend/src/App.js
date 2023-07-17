import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import './App.css';
import axios from 'axios';

function useInterval(callback, delay) {
  const savedCallback = useRef();


  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Messages = (_props) => {
  const [msgs, setMsgs] = useState([]);
  useInterval(() => {
    axios.get('http://localhost:3000/messages', { withCredentials: true })
      .then(response => {
        const messages = response.data;
        setMsgs(messages.slice(-10));
      }).catch(err => {
        console.log(err);
      })
  }, 1000);

  return <div style={{
    width: '500px',
    textAlign: 'center',
    margin: '0 auto',
    outline: 'solid',
    padding: '10px',
    marginBottom: '20px'
  }}>
    {msgs.map(m => <div dangerouslySetInnerHTML={{__html: m.message}} />)}
  </div>
}

function App() {
  const [message, setMessage] = useState("");
  const jwt = Cookies.get('jwt');
  if (!jwt) {
    window.location.href = '/login.html'
  }
  return (
    <div className="App">
      <header className="App-header">
        <div class="message-container">
          <h1>kRaZy chat wall</h1>

          <Messages />
          Message: <input value={message} onChange={event => setMessage(event.target.value)} />
          <button onClick={()=>{
            axios.post('http://localhost:3000/messages', {message});
            setMessage("");
          }}>Submit</button>
        </div>
        <form method="post" action="http://localhost:3000/logout" style={{paddingTop: "50px"}}>
            <input type="submit" value="Logout" />
          </form>
      </header>
    </div>
  );
}

export default App;
