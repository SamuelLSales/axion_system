import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

const ParticlesCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const PARTICLE_COUNT = 50;
    const MAX_DIST = 120;
    const MOUSE_RADIUS = 140;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => { mouseRef.current = { x: null, y: null }; };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 1.5 + 0.5;
      }
      update() {
        const mouse = mouseRef.current;
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            this.x -= dx * force * 0.04;
            this.y -= dy * force * 0.04;
          }
        }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52, 211, 153, 0.7)";
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = 1 - dist / MAX_DIST;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(13, 148, 136, ${alpha * 0.4})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto" }}
    />
  );
};

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginUser(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Erro ao fazer login. Verifique suas credenciais.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0a0f1e] overflow-hidden">
        <ParticlesCanvas />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e]/80 via-[#0a0f1e]/60 to-[#0D9488]/10 pointer-events-none z-[1]" />
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-white font-extrabold text-2xl tracking-widest leading-none">GEOGEST</p>
              <p className="text-[#0D9488] text-[9px] font-bold tracking-[0.2em] uppercase leading-none mt-1">Contratos & Prazos</p>
            </div>
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Gestao inteligente de{" "}
              <span className="text-[#34d399]">contratos</span>{" "}
              e prazos.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Controle absoluto sobre fases, etapas, prazos e resultado
              financeiro - feito para consultorias de topografia, geologia e
              meio ambiente.
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Acesso corporativo seguro - Geogest</span>
          </div>
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div className="w-full lg:w-1/2 bg-[#f8f9fb] flex flex-col">
        <div className="px-10 pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para a Home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
              <p className="text-slate-500 text-sm mt-1">Faca login para gerenciar os projetos e prazos.</p>
            </div>
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">E-mail Corporativo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none transition-all"
                    placeholder="seu@email.com ou admin"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D9488] hover:bg-[#0b7c71] active:bg-[#096b62] text-white font-bold text-sm py-3.5 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-[#0D9488]/20"
              >
                {loading ? "Autenticando..." : "Acessar Painel"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            <div className="mt-8 text-center">
              <Link
                to="/cadastro"
                className="text-[#0D9488] hover:text-[#0b7c71] text-xs font-bold tracking-wider uppercase transition-colors"
              >
                Nao tem conta? Crie agora
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


