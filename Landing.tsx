import React, { Suspense, useState } from 'react';
import { Leaf, FileSearch, Sprout, Tractor, ArrowRight, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from './components/Background3D';
import IntroAnimation from './components/IntroAnimation';
import QuoteForm from './components/QuoteForm';

export default function Landing() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="min-h-screen bg-[#e7ecd9] text-stone-900 font-sans selection:bg-[#1a3d16] selection:text-[#e7ecd9]">
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a3d16]/80 backdrop-blur-md border-b border-[#132c10]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <Leaf className="w-8 h-8 text-[#e7ecd9]" />
             <span className="text-xl font-light tracking-tight text-[#e7ecd9]">Experimentação <span className="font-bold">(Statsig)</span></span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-[#e7ecd9]">
             <a href="#solucoes" className="hover:text-white transition-colors">Serviços</a>
             <a href="#importancia" className="hover:text-white transition-colors">A Importância</a>
             <a href="#processo" className="hover:text-white transition-colors">Nosso Processo</a>
          </div>
          <a href="#contato" className="hidden md:inline-flex bg-[#e7ecd9] hover:bg-white text-[#1a3d16] px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
            Falar com um Especialista
          </a>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden bg-[#1a3d16]">
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1595840656208-8e6ea47dcfca?q=80&w=2000&auto=format&fit=crop" alt="Campo de agricultura" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-10" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#1a3d16]/80 to-[#1a3d16]"></div>
          </div>
          
          <Suspense fallback={null}>
            <Background3D />
          </Suspense>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex py-1.5 px-4 rounded-full bg-[#1a3d16] text-[#e7ecd9] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-[#486b44]">
                Especialistas em Solo
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#e7ecd9] mb-4 leading-[1.1]">
                ASSESSORIA EM <br className="hidden md:block"/>FERTILIDADE DO SOLO
              </h1>
              <p className="text-xl md:text-2xl font-light text-[#c5d1ae] mb-10 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
                Coleta, Calagem e Adubação
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="#contato" className="w-full sm:w-auto inline-flex justify-center items-center h-14 px-8 rounded-full bg-[#e7ecd9] text-[#1a3d16] font-bold hover:bg-white transition-all shadow-lg shadow-black/20">
                  Agendar Coleta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <a href="#solucoes" className="w-full sm:w-auto inline-flex justify-center items-center h-14 px-8 rounded-full bg-transparent text-[#e7ecd9] border border-[#e7ecd9] font-medium hover:bg-[#e7ecd9]/10 transition-all">
                  Nossos Serviços
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="solucoes" className="py-24 bg-[#e7ecd9] px-6">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-[#1a3d16] mb-4">Nossas Especialidades</h2>
               <p className="text-[#3b5937] max-w-2xl mx-auto text-lg">Do campo ao laudo, cuidamos de cada etapa tecnológica do seu solo para garantir que sua lavoura atinja o potencial máximo.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl shadow-[#1a3d16]/5 border border-white/50 hover:bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                 <div className="w-14 h-14 rounded-2xl bg-[#e7ecd9] flex items-center justify-center mb-6 group-hover:bg-[#1a3d16] transition-all duration-300">
                   <FileSearch className="w-7 h-7 text-[#1a3d16] group-hover:text-[#e7ecd9]" />
                 </div>
                 <h3 className="text-xl font-bold text-[#1a3d16] mb-3">Amostragem Técnica</h3>
                 <p className="text-[#3b5937] leading-relaxed">
                   Coleta georreferenciada e estratificada. Utilizamos metodologias rigorosas para garantir que a amostra represente fielmente a realidade da sua área, base essencial para o sucesso.
                 </p>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl shadow-[#1a3d16]/5 border border-white/50 hover:bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                 <div className="w-14 h-14 rounded-2xl bg-[#e7ecd9] flex items-center justify-center mb-6 group-hover:bg-[#1a3d16] transition-all duration-300">
                   <Tractor className="w-7 h-7 text-[#1a3d16] group-hover:text-[#e7ecd9]" />
                 </div>
                 <h3 className="text-xl font-bold text-[#1a3d16] mb-3">Recomendação de Calagem</h3>
                 <p className="text-[#3b5937] leading-relaxed">
                   Correção inteligente da acidez do solo. Cálculo preciso da necessidade de calcário e gesso agrícola, neutralizando alumínio tóxico e melhorando totalmente o ambiente radicular.
                 </p>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl shadow-[#1a3d16]/5 border border-white/50 hover:bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group">
                 <div className="w-14 h-14 rounded-2xl bg-[#e7ecd9] flex items-center justify-center mb-6 group-hover:bg-[#1a3d16] transition-all duration-300">
                   <Sprout className="w-7 h-7 text-[#1a3d16] group-hover:text-[#e7ecd9]" />
                 </div>
                 <h3 className="text-xl font-bold text-[#1a3d16] mb-3">Adubação Específica</h3>
                 <p className="text-[#3b5937] leading-relaxed">
                   Prescrição de NPK e micronutrientes baseada na expectativa de produtividade da sua cultura e histórico da área, evitando desperdícios e maximizando diretamente o seu lucro.
                 </p>
               </motion.div>
             </div>
          </div>
        </section>

        <section id="importancia" className="py-24 bg-[#1a3d16] text-[#e7ecd9] px-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none">
             <Leaf className="w-96 h-96 transform rotate-45" />
           </div>
           <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-12 relative z-10">
             <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8 w-full">
               <span className="text-[#c5d1ae] font-semibold tracking-wider uppercase text-sm border-b border-[#c5d1ae] pb-1">Porque Analisar?</span>
               <h2 className="text-3xl md:text-5xl font-extrabold leading-[1.15] text-white">
                 Adubar sem análise de solo é como atirar no escuro.
               </h2>
               <p className="text-lg text-[#c5d1ae] font-light leading-relaxed max-w-3xl mx-auto">
                 Os fertilizantes representam uma das maiores parcelas do custo de produção. Uma análise criteriosa não é um gasto, é o melhor investimento que você pode fazer para otimizar os recursos da sua propriedade.
               </p>
               <ul className="space-y-4 pt-4 text-left max-w-2xl mx-auto">
                 {[
                   "Elimina o desperdício de adubos e corretivos caros",
                   "Corrige o pH liberando nutrientes que estavam travados no solo",
                   "Aumenta a resistência das plantas contra pragas e seca",
                   "Traz previsibilidade, segurança e aumenta sua rentabilidade"
                 ].map((item, i) => (
                   <motion.li initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }} key={i} className="flex items-start text-[#e7ecd9]">
                     <CheckCircle2 className="w-6 h-6 text-[#1a3d16] bg-[#c5d1ae] rounded-full p-1 mr-4 shrink-0 mt-0.5" />
                     <span className="leading-relaxed text-lg">{item}</span>
                   </motion.li>
                 ))}
               </ul>
             </motion.div>
           </div>
        </section>

        <section id="processo" className="py-24 bg-white px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3d16] mb-4">Como Funciona Nosso Trabalho</h2>
            <p className="text-[#3b5937] text-lg">Um método validado de 4 etapas para trazer os melhores resultados para a sua fazenda, com transparência e muito rigor técnico.</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {[
                { step: "1", title: "Visita e Diagnóstico", desc: "Vamos até a sua propriedade entender o histórico de plantio e mapear as áreas com alta variação." },
                { step: "2", title: "Coleta Técnica", desc: "Realizamos a retirada das amostras com equipamento correto, na profundidade adequada ao seu cultivo." },
                { step: "3", title: "Análise Laboratorial", desc: "Envio rápido para laboratórios credenciados de alta precisão e confiabilidade no mercado." },
                { step: "4", title: "Entrega e Laudo", desc: "Apresentamos o laudo interpretado junto com todas as recomendações de calagem e adubação." }
              ].map((item, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} key={i} className="relative group flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1a3d16] text-[#e7ecd9] flex items-center justify-center text-2xl font-black shadow-sm group-hover:scale-110 transition-transform duration-300 z-10">
                    {item.step}
                  </div>
                  {i < 3 && <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-[2px] bg-[#e7ecd9] -z-0"></div>}
                  {i % 2 === 0 && <div className="hidden sm:block lg:hidden absolute top-8 left-[60%] right-[-40%] h-[2px] bg-[#e7ecd9] -z-0"></div>}

                  <h4 className="text-xl font-bold text-[#1a3d16] mb-3 mt-6">{item.title}</h4>
                  <p className="text-[#3b5937] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className="py-24 bg-[#e7ecd9] px-6">
           <div className="max-w-6xl mx-auto bg-[#1a3d16] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-[#1a3d16]/30">
             <div className="flex-1 p-10 md:p-16 flex flex-col justify-center text-[#e7ecd9] bg-[#1a3d16] relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">Pronto para aumentar a sua produtividade no campo?</h2>
                 <p className="text-[#c5d1ae] mb-12 text-lg font-light leading-relaxed">
                   Fale direto com a nossa equipe agronômica e agende a sua primeira consultoria de avaliação técnica.
                 </p>
                 
                 <div className="space-y-8">
                   <div className="flex items-center group">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-5 border border-white/20">
                        <Phone className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-xl font-bold tracking-wide text-white">(69) 9 9935-7831</span>
                   </div>
                   <div className="flex items-center group">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-5 border border-white/20">
                        <MapPin className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-lg font-medium tracking-wide">
                        Rua Açaí, 670 — Jardim Jorge Teixeira<br/>
                        Ariquemes - RO | 76876-520
                     </span>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="flex-1 bg-white p-10 md:p-16">
               <h3 className="text-2xl font-bold text-[#1a3d16] mb-2">Solicite um Orçamento</h3>
               <p className="text-[#3b5937] mb-8 font-light">Os dados serão enviados para análise de nossos especialistas.</p>
               <QuoteForm />
             </div>
           </div>
        </section>
      </main>

      <footer className="bg-[#1a3d16] py-12 px-6 text-center border-t border-[#132c10]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center space-x-2 mb-6 md:mb-0">
             <Leaf className="w-6 h-6 text-[#e7ecd9]" />
             <span className="text-xl font-light tracking-tight text-[#e7ecd9]">Experimentação <span className="font-bold">(Statsig)</span></span>
           </div>
           
           <p className="text-[#c5d1ae] text-sm font-medium">
             &copy; {new Date().getFullYear()} Experimentação (Statsig). Todos os direitos reservados.
           </p>
         </div>
      </footer>
    </div>
  );
}
