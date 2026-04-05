import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import GvgMode from './pages/GvgMode';
import Equip from './pages/Equip';
import Pets from './pages/Pets';
import Rings from './pages/Rings';
import EquipmentSets from './pages/EquipmentSets';
import About from './pages/About';
import Updates from './pages/Updates';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* GVG modes */}
          <Route path="attack" element={<GvgMode mode="attack" />} />
          <Route path="defense/phy" element={<GvgMode mode="defense-phy" />} />
          <Route path="defense/mage" element={<GvgMode mode="defense-mage" />} />
          <Route path="defense/tank" element={<GvgMode mode="defense-tank" />} />

          {/* Database pages */}
          <Route path="characters" element={<Characters />} />
          <Route path="characters/:slug" element={<CharacterDetail />} />
          <Route path="pets" element={<Pets />} />
          <Route path="rings" element={<Rings />} />
          <Route path="equipment" element={<EquipmentSets />} />
          <Route path="equip" element={<Equip />} />

          {/* Updates */}
          <Route path="updates" element={<Updates />} />

          {/* Admin */}
          <Route path="admin" element={<Admin />} />

          {/* Misc */}
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
