import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './components/ThemeProvider.jsx'

// The admin panel is code-split: visitors to the public site never download
// the Supabase auth flow, the CRUD forms or the upload widget.
const Admin = lazy(() => import('./admin/Admin.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/admin/*"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center bg-background text-xs uppercase tracking-[0.3em] text-muted">
                    Loading console…
                  </div>
                }
              >
                <Admin />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
