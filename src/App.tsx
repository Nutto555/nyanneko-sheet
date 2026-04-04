import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Guides from './pages/Guides';
import Compositions from './pages/Compositions';
import TierList from './pages/TierList';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="characters" element={<Characters />} />
          <Route path="characters/:slug" element={<CharacterDetail />} />
          <Route path="guides" element={<Guides />} />
          <Route path="compositions" element={<Compositions />} />
          <Route path="tier-list" element={<TierList />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
