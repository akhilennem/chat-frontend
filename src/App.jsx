import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Login/loginPage'; // Import your login page
import Chat from './ChatApp/chat'; // Import your chat app
import Signup from './Signup/Signup'; // Import your chat app

const user = { name: "Akhil" };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />  {/* Set LoginPage as root */}
        <Route path="/chat" element={<Chat user={user} />} /> {/* Redirect to Chat */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
