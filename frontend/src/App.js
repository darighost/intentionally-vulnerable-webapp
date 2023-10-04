import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import './App.css';

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

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
  const [funds, setFunds] = useState(NaN);
  useEffect(()=>{
    fetch("/check_funds", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({user})
    }).then(res => {
      return res.json();
    }).then(newFunds => {
      setFunds(newFunds.funds);
    })
  }, []);
  const jwt = Cookies.get('jwt');
  if (!jwt) {
    window.location.href = '/login.html'
  }
  const user = parseJwt(document.cookie.split('jwt=')[1]).user;
  return (
    <div className="App">
      <header className="App-header">
        <div class="message-container">
          <h1>kRaZy chat wall</h1>
          Current funds: {funds}
          <Messages />
          Message: <input value={message} onChange={event => setMessage(event.target.value)} />
          <button onClick={async ()=>{
            const res = await fetch("/check_funds", {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify({user})
            });
            const newRes = await res.json();
            console.log(newRes)
            setFunds(newRes.funds);
            if (funds <= 0) {
              alert('YOU HAVE INSUFFICIENT FUNDS');
            } else if (funds > 0) {
              await fetch("/spend", {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({ user })
              })
              await fetch("/messages", {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({message, user})
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
