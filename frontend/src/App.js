import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import './App.css';

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
    fetch('/messages').then(res => {
      res.json().then(messages => {
        setMsgs(messages.slice(-10));
      })
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
          <button onClick={async ()=>{
            const res = await fetch("/check_funds");
            const { funds } = await res.json();
            if (funds <= 0) {
              alert('YOU HAVE INSUFFICIENT FUNDS');
            } else {
              await fetch("/messages", {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({message})
              })
            }
            
            setMessage("");
          }}>Submit</button>
        </div>
      </header>
    </div>
  );
}

export default App;
