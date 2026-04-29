import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Users, ShieldCheck, ArrowRight, Building2, HardHat } from 'lucide-react';

const LandingPage = () => {
  const { login, user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'Citizen') navigate('/citizen');
      if (user.role === 'Admin') navigate('/admin');
      if (user.role === 'Worker') navigate('/worker');
    }
  }, [user, navigate]);

  const [view, setView] = useState('citizen');
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (view === 'citizen') {
      if (login(creds.email, creds.password, 'Citizen')) {
        navigate('/citizen');
      } else {
        setError('Invalid password. Try citizen123');
      }
    } else if (view === 'admin') {
      if (login(creds.email, creds.password, 'Admin')) {
        navigate('/admin');
      } else {
        setError('Invalid credentials. Try admin@city.in / admin123');
      }
    } else if (view === 'worker') {
      if (login(creds.email, creds.password, 'Worker')) {
        navigate('/worker');
      } else {
        setError('Invalid worker ID or password (try WRK-001 / worker123)');
      }
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setCreds({ email: '', password: '' });
    setError('');
  };

  const bgStyle = {
    backgroundColor: '#0A0E1A'
  };

  const cardStyle = {
    backgroundColor: '#111827',
    border: '1px solid #2A3347',
    boxShadow: '0 0 48px rgba(245, 158, 11, 0.08)',
    borderTop: '3px solid #F59E0B',
    borderRadius: '16px'
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-8 relative" style={bgStyle}>
      
      {/* AMBER RADIAL GLOW */}
      <div style={{
        background: 'radial-gradient(ellipse 700px 350px at 50% 0%, rgba(245, 158, 11, 0.07) 0%, transparent 70%)',
        pointerEvents: 'none', position: 'absolute', top: 0, left: 0, 
        width: '100%', height: '100%', zIndex: 0
      }}></div>

      <div className="text-center max-w-2xl mb-10 relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight" style={{ color: '#F1F5F9' }}>
          Empowering Citizens,<br />
          <span style={{ color: '#F59E0B' }}>Improving Our City.</span>
        </h1>
        <p className="text-lg" style={{ color: '#94A3B8' }}>
          A modern civic platform to report issues, track resolutions, and keep our community thriving together.
        </p>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {view === 'citizen' ? (
          <div className="p-8 flex flex-col" style={cardStyle}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <Users className="h-6 w-6" style={{ color: '#F59E0B' }} />
              </div>
              <h2 className="text-2xl font-bold font-heading" style={{ color: '#F1F5F9' }}>Citizen Portal</h2>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col space-y-4">
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="Enter email"
                  value={creds.email}
                  onChange={(e) => setCreds({...creds, email: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="Enter password"
                  value={creds.password}
                  onChange={(e) => setCreds({...creds, password: e.target.value})}
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
              
              <div className="pt-4">
                <button type="submit" className="w-full flex justify-center items-center space-x-2 font-heading font-bold py-2.5 px-4 rounded-[10px] transition-all" style={{ backgroundColor: '#F59E0B', color: '#0A0E1A' }}>
                  <span>Login as Citizen</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm pt-6" style={{ borderTop: '1px solid #2A3347', color: '#94A3B8' }}>
              <div>
                Are you an administrator?{' '}
                <button 
                  onClick={() => switchView('admin')}
                  className="font-medium hover:underline focus:outline-none transition-colors"
                  style={{ color: '#F1F5F9' }}
                >
                  Login as admin
                </button>
              </div>
              <div className="mt-3 text-[13px]">
                Are you a field worker?{' '}
                <button
                  onClick={() => switchView('worker')}
                  className="font-medium hover:text-[#F59E0B] focus:outline-none transition-colors"
                  style={{ color: '#94A3B8' }}
                >
                  Worker Login →
                </button>
              </div>
            </div>
          </div>
        ) : view === 'admin' ? (
          <div className="p-8 flex flex-col" style={cardStyle}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                <ShieldCheck className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
              <h2 className="text-2xl font-bold font-heading" style={{ color: '#F1F5F9' }}>Admin Portal</h2>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col space-y-4">
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Admin Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="Enter email"
                  value={creds.email}
                  onChange={(e) => setCreds({...creds, email: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="Enter password"
                  value={creds.password}
                  onChange={(e) => setCreds({...creds, password: e.target.value})}
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
              
              <div className="pt-4">
                <button type="submit" className="w-full flex justify-center items-center space-x-2 font-heading font-bold py-2.5 px-4 rounded-[10px] transition-all" style={{ backgroundColor: '#1C2333', color: '#F1F5F9', border: '1px solid #2A3347' }}>
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm pt-6" style={{ borderTop: '1px solid #2A3347', color: '#94A3B8' }}>
              Are you a citizen?{' '}
              <button 
                onClick={() => switchView('citizen')}
                className="font-medium hover:underline focus:outline-none transition-colors"
                style={{ color: '#F1F5F9' }}
              >
                Login as citizen
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col" style={cardStyle}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <HardHat className="h-6 w-6" style={{ color: '#F59E0B' }} />
              </div>
              <h2 className="text-2xl font-bold font-heading" style={{ color: '#F1F5F9' }}>Worker Portal</h2>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col space-y-4">
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Employee ID</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="e.g. WRK-001"
                  value={creds.email}
                  onChange={(e) => setCreds({...creds, email: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label" style={{ color: '#94A3B8' }}>Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full rounded-lg px-4 py-2 outline-none transition-all focus:ring-[3px]" 
                  style={{ backgroundColor: '#1C2333', border: '1px solid #2A3347', color: '#F1F5F9' }}
                  placeholder="Enter password"
                  value={creds.password}
                  onChange={(e) => setCreds({...creds, password: e.target.value})}
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
              
              <div className="pt-4">
                <button type="submit" className="w-full flex justify-center items-center space-x-2 font-heading font-bold py-2.5 px-4 rounded-[10px] transition-all" style={{ backgroundColor: '#F59E0B', color: '#0A0E1A' }}>
                  <span>Login as Worker →</span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm pt-6" style={{ borderTop: '1px solid #2A3347', color: '#94A3B8' }}>
              <button 
                onClick={() => switchView('citizen')}
                className="font-medium hover:underline focus:outline-none transition-colors"
                style={{ color: '#F1F5F9' }}
              >
                Back to Citizen Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LandingPage;
