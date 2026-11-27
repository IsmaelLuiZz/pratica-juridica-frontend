import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/session'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Assistidos, AssistidoDetalhe } from './pages/Assistidos'
import { Atendimentos, NovoAtendimento } from './pages/Atendimentos'
import { Casos, NovoCaso } from './pages/Casos'
import { CasoDetalhe } from './pages/CasoDetalhe'
import { Prazos } from './pages/Prazos'
import { Supervisao } from './pages/Supervisao'

function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={usuario?.perfil === 'ALUNO' ? '/casos' : '/dashboard'} replace />
}
export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']} />}><Route path="dashboard" element={<Dashboard />} /></Route>
        <Route element={<ProtectedRoute roles={['PROFESSOR']} />}><Route path="supervisao" element={<Supervisao />} /></Route>
        <Route path="assistidos" element={<Assistidos />} />
        <Route path="assistidos/:id" element={<AssistidoDetalhe />} />
        <Route path="atendimentos" element={<Atendimentos />} />
        <Route path="atendimentos/novo" element={<NovoAtendimento />} />
        <Route path="casos" element={<Casos />} />
        <Route path="casos/novo" element={<NovoCaso />} />
        <Route path="casos/:id" element={<CasoDetalhe />} />
        <Route path="prazos" element={<Prazos />} />
        <Route path="*" element={<section className="panel"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></section>} />
      </Route>
    </Route>
  </Routes></AuthProvider></BrowserRouter>
}
