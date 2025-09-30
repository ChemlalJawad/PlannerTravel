import Navigation from './components/Navigation';
import { TripProvider } from './context/TripContext';
import { DarkModeProvider } from './context/DarkModeContext';
import './App.css';

function App() {
  return (
    <DarkModeProvider>
      <TripProvider>
        <div className="App">
          <Navigation />
        </div>
      </TripProvider>
    </DarkModeProvider>
  );
}

export default App;
