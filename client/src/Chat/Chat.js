import SendIcon from '@mui/icons-material/Send';
import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
const { io } = require('socket.io-client');

function Chat({ loggedUser }) {
  const [socket, setSocket] = useState();
  const [messages, setMessages] = useState([]);
  const [newTextMessage, setNewTextMessage] = useState('');
  const [usersTyping, setUsersTyping] = useState([]);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    setSocket(
      io('http://localhost:3001/', {
        query: `loggedUser=${encodeURIComponent(JSON.stringify(loggedUser))}`,
      })
    );
  }, [loggedUser]);

  useEffect(() => {
    if (socket) {
      socket.connect();

      socket.on('listMessages', (messages) => {
        setMessages(
          messages.map((m) => {
            return { ...m, isFromMe: m.user.nickname === loggedUser.nickname };
          })
        );
      });

      socket.on('newMessageReceived', (newMessage) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...newMessage,
            isFromMe: newMessage.user.nickname === loggedUser.nickname,
          },
        ]);
        setNewTextMessage('');
      });

      socket.on('typing', (nickname) => {
        if (!usersTyping.includes(nickname)) {
          setUsersTyping([...usersTyping, nickname]);
        }
      });

      socket.on('stopTyping', (nickname) => {
        if (usersTyping.includes(nickname)) {
          setUsersTyping([
            ...usersTyping.filter((userNickname) => userNickname !== nickname),
          ]);
        }
      });

      return () => {
        socket.off('listMessages');
        socket.off('newMessageReceived');
        socket.off('newMessage');
        socket.off('typing');
        socket.off('stopTyping');
      };
    }
  }, [socket, loggedUser, usersTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOnClick = () => {
    if (newTextMessage?.length > 0) {
      socket.emit('newMessage', newTextMessage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newTextMessage?.length > 0) {
      socket.emit('newMessage', newTextMessage);
    }
  };

  const handleOnChange = (e) => {
    setNewTextMessage(e.target.value);
  };

  const scrollToBottom = () => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current?.scrollHeight });
  };

  const handleOnFocus = () => {
    socket.emit('typing', loggedUser.nickname);
  };

  const handleOnBlur = () => {
    socket.emit('stopTyping', loggedUser.nickname);
  };

  return (
    <div className="Chat">
      <div className="Chat-header">
        <h4>Fiestas de Bullas</h4>
        <div className="Chat-header_left">
          Bienvenid@ <i>{loggedUser.nickname}</i>
          <span>
            <img
              src={loggedUser.photo}
              alt={`${loggedUser.nickname}-header-pic`}
            />
          </span>
        </div>
      </div>
      <div className="Chat-body">
        <div className="Chat-body_messageWrapper" ref={chatBodyRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`Chat-body_message ${
                m.isFromMe ? 'Own-message' : 'OtherPerson-message'
              }`}
            >
              <img
                src={m.user?.photo || 'https://picsum.photos/30'}
                alt={`${m.user.nickname}-pic`}
              ></img>
              <p>
                <span className="Message-nickname">{m.user.nickname}</span>
                <br />
                {m.text}
              </p>
            </div>
          ))}
        </div>
        {usersTyping.length > 0 && (
          <div className="Chat-body_typing">
            <i>
              {usersTyping.join(', ')}{' '}
              {usersTyping.length > 1 ? 'están' : 'está'} escribiendo...
            </i>
          </div>
        )}
      </div>
      <div className="Chat-footer">
        <input
          type="text"
          placeholder="Deja tu mensajico"
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          maxLength={250}
          value={newTextMessage}
        ></input>
        <div className="Chat-footer_sendImg" onClick={handleOnClick}>
          <SendIcon />
        </div>
      </div>
    </div>
  );
}

export default Chat;
