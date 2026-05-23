'use client';
import React from 'react';
import ElektroKalkulator from '@/components/ElektroKalkulator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* SEKCJA TOP BAR / KONTAKT */}
      <div className="bg-gray-950 text-gray-400 text-xs py-2 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>📍 Obszar działań: Podhale, Zakopane, Nowy Targ, Bukowina Tatrzańska i okolice</div>
          <div className="flex gap-4">
            <a href="tel:+48606740118" className="text-yellow-400 hover:underline font-bold">📞 Zadzwoń: +48 606 740 118</a>
            <span>NIP: 7361626109</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION - WIZERUNEK FIRMY */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 text-white py-16 px-4 border-b-4 border-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="bg-yellow-500 text-black text-xs uppercase font-black px-3 py-1 rounded">Profesjonalne Usługi Elektryczne</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Tomasz Budz Elektro-Podhale</h1>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Kompleksowe elektroinstalatorstwo na Podhalu. Nowe przyłącza kablowe realizujemy z aluminium YAKY 4x35 lub YAKY 4x50 w standardzie <strong className="text-yellow-400">TAURON Dystrybucja</strong>, plus roboty ziemne w trudnym terenie i instalacje domowe.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3 print:hidden">
            <a href="#kalkulator" className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold px-6 py-3 rounded-lg transition text-sm uppercase tracking-wider shadow-md">
              🧮 Wycena Online dla TAURON
            </a>
            <a href="tel:+48606740118" className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold px-6 py-3 rounded-lg transition text-sm uppercase tracking-wider">
              Szybki Kontakt
            </a>
          </div>
        </div>
      </header>

      {/* O FIRMIE I ZAKRES USŁUG */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEWA KOLUMNA: O NAS I USŁUGI */}
        <section className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-900">O firmie</h2>
            <p className="text-sm text-gray-600 leading-relaxed text-justify">
              Firma <strong>Tomasz Budz Elektro-Podhale</strong> ma swoją siedzibę w malowniczej Bukowinie Tatrzańskiej. Dokładamy wszelkich starań, aby oferowane przez nas usługi były na jak najwyższym poziomie technicznym i proceduralnym.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed text-justify">
              Doskonale rozumiemy specyfikę skalistego podłoża fliszu podhalańskiego, co pozwala nam bezbłędnie i bezpiecznie planować roboty ziemne pod okablowanie, unikając kosztownych niespodzianek.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-3">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-900">Zakres Specjalizacji</h2>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex items-center gap-2">⚡ <strong className="text-gray-900">Przyłącza energetyczne</strong> (Ziemne i napowietrzne)</li>
              <li className="flex items-center gap-2">🏗️ <strong className="text-gray-900">Obsługa eBOK TAURON</strong> (Wnioski, dokumenty OST)</li>
              <li className="flex items-center gap-2">📐 <strong className="text-gray-900">Pomiary elektryczne</strong> (Odbiorcze i okresowe)</li>
              <li className="flex items-center gap-2">🏠 <strong className="text-gray-900">Instalacje wewnętrzne</strong> (Domy, pensjonaty, przemysł)</li>
              <li className="flex items-center gap-2">🔄 <strong className="text-gray-900">Modernizacje i remonty</strong> (Wynoszenie liczników na zewnątrz)</li>
              <li className="flex items-center gap-2">⚡ <strong className="text-gray-900">Rozdzielnice i prefabrykacja</strong> (Szafy zasilające, Erbetki)</li>
              <li className="flex items-center gap-2">⛰️ <strong className="text-gray-900">Roboty ziemne</strong> (Wykopy liniowe w terenie trudnym)</li>
              <li className="flex items-center gap-2">🛡️ <strong className="text-gray-900">Instalacje odgromowe</strong> (Zabezpieczenia budynków)</li>
            </ul>
          </div>

          {/* DANE REGISTROWE I ADRES */}
          <div className="bg-gray-900 text-gray-300 p-6 rounded-xl space-y-3 text-xs border border-gray-800">
            <h3 className="font-bold text-white uppercase text-sm tracking-wider text-yellow-400">Pełne dane rejestrowe:</h3>
            <div>
              <p className="font-bold text-sm text-white">Tomasz Budz Elektro-Podhale</p>
              <p>ul. Długa 74</p>
              <p>34-530 Bukowina Tatrzańska</p>
              <p>Województwo: małopolskie</p>
            </div>
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <p><strong>NIP:</strong> 7361626109</p>
              <p><strong>Telefon:</strong> +48 606 740 118</p>
            </div>
          </div>
        </section>

        {/* PRAWA KOLUMNA: KALKULATOR KOSZTÓW ONLINE */}
        <section id="kalkulator" className="lg:col-span-8 scroll-mt-6">
          <ElektroKalkulator />
        </section>

      </main>

      {/* STOPKA STRONY */}
      <footer className="bg-gray-950 text-gray-500 text-xs py-8 mt-12 border-t border-gray-800 text-center space-y-2">
        <p className="font-bold text-gray-400">© 2026 Tomasz Budz Elektro-Podhale. Wszelkie prawa zastrzeżone.</p>
        <p>Projekt i realizacja dedykowanego systemu wycen przyłączy budowlanych.</p>
        <p className="text-[10px] text-gray-600">Siedziba: ul. Długa 74, 34-530 Bukowina Tatrzańska | NIP: 7361626109 | Kontakt tel: +48 606 740 118</p>
        <p className="text-[10px] text-gray-600 font-semibold">
          Twórca strony: <a href="https://centrumzakopane.pl" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">TEL-SERVICE</a>
        </p>
      </footer>

    </div>
  );
}
