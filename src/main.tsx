
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// تأخير تحميل التطبيق للتأكد من اكتمال تحميل السياق
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
