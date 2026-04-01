export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0c1324]/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_20px_40px_-12px_rgba(192,193,255,0.08)] flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-indigo-200" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        <h1 className="font-headline font-black text-xl tracking-[0.2em] text-[#c0c1ff]">KINETIC_ORACLE</h1>
      </div>
      <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container overflow-hidden active:scale-95 duration-200 transition-all hover:brightness-125">
        <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlhaPdVK85hixGrtPZK-siIStN_ciW4dY5t-5B1Or616rjgz_TJwQMMSYun_He6BVIYGv-ioVGes2lX24FlrtSjXb2oTQ33J_KzLqIL2OwtQRo0AT82ekjGQIXzNupgZPq1PedL0aKfKX4YaxU23NdFgtPXbdVy0HEMqenv7eorssti_4r4ZS7flcK8OJ5oDNknDgunBbAVTGMMeKPyVrBdJfeIxh934YfJHnzVJsaSKUqlgtPHxGBnCeNisXAII-3FXRySm56wpmi"/>
      </div>
    </header>
  );
}
