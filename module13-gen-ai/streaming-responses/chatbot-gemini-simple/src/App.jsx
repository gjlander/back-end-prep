import { useState, useRef, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import './index.css';
import { getChatHistory } from './data/gemini';
import Form from './components/Form';
import Chat from './components/Chat';
function App() {
  const chatRef = useRef();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(localStorage.getItem('chatId'));

  useEffect(() => {
    const getAndSetChatHistory = async () => {
      try {
        const { history } = await getChatHistory(chatId);
        setMessages(history);
      } catch (error) {
        localStorage.removeItem('chatId');
      }
    };

    chatId && getAndSetChatHistory();
  }, []);

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  return (
    <div className='h-screen container mx-auto p-5 flex flex-col justify-between gap-5'>
      <Chat chatRef={chatRef} messages={messages} />
      <Form chatRef={chatRef} setMessages={setMessages} chatId={chatId} setChatId={setChatId} />
      <ToastContainer autoClose={1500} theme='colored' />
    </div>
  );
}

export default App;
