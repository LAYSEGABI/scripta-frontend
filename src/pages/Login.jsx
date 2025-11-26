import React, { useState } from 'react';
import { LogIn, Lock, User } from 'lucide-react';
import { UserService } from '../services/UserServices';
import '../styles/usuarios.css'; // Reaproveitando estilos

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. Chama o serviço de login
      const dados = await UserService.login(matricula, senha);
      
      // 2. O Miguel disse que retorna o token. Vamos salvar!
      // Se o retorno for { token: "..." }, usamos dados.token
      // Se o retorno for direto o token, usamos dados
      const tokenRecebido = dados.token || dados; 

      if (tokenRecebido) {
          localStorage.setItem("token", tokenRecebido);
          // Salva a matricula também para saber quem logou
          localStorage.setItem("usuario_matricula", matricula); 
          
          // 3. Redireciona para o Dashboard
          window.location.href = "/dashboard"; 
      } else {
          setErro("O sistema não retornou um token válido.");
      }

    } catch (error) {
      setErro("Falha no login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', backgroundColor: '#f0fdf4' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: '#dcfce7', color: '#16a34a', width: '60px', height: '60px', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1rem' 
          }}>
            <LogIn size={32} />
          </div>
          <h2 style={{ color: '#166534' }}>Acesso ao Sistema</h2>
          <p style={{ color: '#64748b' }}>Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="form-container">
          <div className="form-group">
            <label>Matrícula / Login</label>
            <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: admin"
                  required
                  style={{ paddingLeft: '35px' }}
                />
                <User size={18} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }}/>
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="form-input" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '35px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }}/>
            </div>
          </div>

          {erro && (
            <div style={{ 
              backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', 
              borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center'
            }}>
              {erro}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* Dica para facilitar os testes */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
          <p>Teste: admin / adminsenha123456</p>
        </div>
      </div>
    </div>
  );
}