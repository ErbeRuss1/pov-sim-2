import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Airlines from './pages/Airlines';
import Flights from './pages/Flights';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/airlines" element={<Airlines />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;
