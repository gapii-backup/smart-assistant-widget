import '../ChatWidget';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          AI Chat Widget Demo
        </h1>
        
        <p className="text-lg text-gray-400 mb-8">
          Premium chat widget z dark mode dizajnom, streaming odgovori, 
          session management in posebnimi akcijami.
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            'Dark Mode',
            'Streaming',
            'Session History',
            'Contact Form',
            'Cal.com Booking',
            'Newsletter',
            'Product Cards'
          ].map(feature => (
            <span 
              key={feature}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
            >
              {feature}
            </span>
          ))}
        </div>
        
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left">
          <h3 className="text-lg font-semibold mb-3 text-white">Kako uporabiti</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Kliknite na modri gumb spodaj desno za odprtje chat widget-a. 
            Widget podpira streaming odgovore, shranjevanje pogovorov in 
            posebne akcije kot so kontaktni obrazec, rezervacija termina in več.
          </p>
        </div>
      </div>
      
      <footer className="absolute bottom-6 text-center">
        <a 
          href="https://botmotion.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          Powered by BotMotion
        </a>
      </footer>
    </div>
  );
};

export default Index;
