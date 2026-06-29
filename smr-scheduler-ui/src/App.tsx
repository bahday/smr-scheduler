import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ActingAsProvider } from './context/ActingAsContext';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { BookPage } from './pages/BookPage';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <ActingAsProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          </Routes>
        </Layout>
      </ActingAsProvider>
    </BrowserRouter>
  );
}

export default App;
