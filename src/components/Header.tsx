function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">DiagnoseHUB</h1>
          <p className="text-xs text-slate-400">
            KI-gestützte Fahrzeugdiagnose
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#" className="transition hover:text-white">
            Diagnose
          </a>
          <a href="#" className="transition hover:text-white">
            Fehlercodes
          </a>
          <a href="#" className="transition hover:text-white">
            Fahrzeuge
          </a>
          <a href="#" className="transition hover:text-white">
            Premium
          </a>
        </nav>

        <button className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white">
          Login
        </button>
      </div>
    </header>
  );
}

export default Header;