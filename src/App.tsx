import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { BulkCsvPage } from './pages/BulkCsvPage';
import { HomePage } from './pages/HomePage';
import {
  AllPatternsPage,
  CommonHumanChoicePage,
  InitialBasedPage,
  MiddleNamePage,
  ShortNumberPage,
} from './pages/PatternPages';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/all" element={<AllPatternsPage />} />
        <Route path="/middle-name" element={<MiddleNamePage />} />
        <Route path="/initial-based" element={<InitialBasedPage />} />
        <Route path="/common-human-choice" element={<CommonHumanChoicePage />} />
        <Route path="/short-number" element={<ShortNumberPage />} />
        <Route path="/bulk-csv" element={<BulkCsvPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
