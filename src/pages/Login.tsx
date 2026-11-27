import { LockKeyhole, Scale } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Field, Form} from '../components/ui'
import { value } from '../components/formValues'
import { perfis } from '../components/format'
import { useAuth } from '../contexts/session'
import { login } from '../services/auth'

export function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  if (usuario) return <Navigate to="/" replace />
  return <main className="login">
    <section className="login-brand"><div><span className="brand-mark"><Scale size={30} /></span>
      <h1>Sistema de Gestão da<br /> Prática Jurídica</h1>
      <p>Atendimentos, casos, atividades e prazos em um só lugar,<br /> com supervisão acadêmica integrada.</p>
      <small>UNINASSAU · João Pessoa</small>
    </div></section>
    <section className="login-access"><div><h2>Acessar o sistema</h2>
      <Form label="Entrar" onSave={async form => {
        const session = await login(value(form, 'email'), String(form.get('senha') ?? ''))
        if (session.perfil !== value(form, 'perfil')) throw new Error('Selecione o perfil associado à sua conta.')
        entrar(session)
        const from: unknown = location.state?.from
        navigate(typeof from === 'string' && /^\/(?!\/)/.test(from) ? from : '/', { replace: true })
      }}>
        <Field label="E-mail institucional"><input name="email" type="email" autoComplete="username" required /></Field>
        <Field label="Senha"><input name="senha" type="password" autoComplete="current-password" required /></Field>
        <Field label="Perfil"><select name="perfil">{Object.entries(perfis).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
      </Form>
      <p className="privacy"><LockKeyhole size={14} /> Acesso restrito a usuários cadastrados. Dados protegidos pela LGPD.</p>
    </div></section>
  </main>
}
