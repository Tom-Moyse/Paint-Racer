import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserContextProvider } from './utils/UserContext'

const HomePage = lazy(() => import('./pages/home/HomePage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const RegisterPage = lazy(() => import('./pages/register/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const TrackBrowserPage = lazy(() => import('./pages/trackbrowse/TrackBrowserPage'));
const TrackEditPage = lazy(() => import('./pages/trackedit/TrackEditPage'));
const TrackRacePage = lazy(() => import('./pages/trackrace/TrackRacePage'));

function App() {
  return (
    <UserContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/' element={<HomePage />}/>
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/register' element={<RegisterPage />}/>
          <Route path='/profile' element={<ProfilePage />}/>
          <Route path='/tracks' element={<TrackBrowserPage />}/>
          <Route path='/trackedit' element={<TrackEditPage />}/>
          <Route path='/trackrace/:id' element={<TrackRacePage />}/>
        </Routes>
      </Suspense>
    </UserContextProvider>
  )
}

export default App
