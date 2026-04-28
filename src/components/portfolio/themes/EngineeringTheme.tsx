'use client'
import { ParsedResume } from '@/lib/ai/parseResume'

export default function EngineeringTheme({ data }: { data: ParsedResume }) {
  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] min-h-screen font-mono">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-[#0d1117]/90 backdrop-blur border-b border-[#30363d] z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[#58a6ff] font-bold text-lg">{data.name.toLowerCase().replace(' ', '_')}</span>
          <div className="flex gap-6 text-sm text-[#8b949e]">
            <a href="#about" className="hover:text-[#58a6ff] transition-colors">about</a>
            <a href="#experience" className="hover:text-[#58a6ff] transition-colors">experience</a>
            <a href="#projects" className="hover:text-[#58a6ff] transition-colors">projects</a>
            <a href="#contact" className="hover:text-[#58a6ff] transition-colors">contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="about" className="min-h-screen flex items-center pt-20">
        <div className="max-w-5xl mx-auto px-6 py-20 w-full">
          <div className="mb-4 text-[#3fb950] text-sm">// hello world</div>
          <h1 className="text-6xl font-bold text-white mb-4">
            {data.name}
          </h1>
          <div className="text-2xl text-[#58a6ff] mb-8">
            <span className="text-[#ff7b72]">const</span>{' '}
            <span className="text-[#79c0ff]">role</span>{' '}
            <span className="text-white">=</span>{' '}
            <span className="text-[#a5d6ff]">"{data.title}"</span>
          </div>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed mb-10">{data.summary}</p>
          <div className="flex flex-wrap gap-3 mb-12">
            {data.skills.slice(0, 8).map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-md text-[#58a6ff] text-sm hover:border-[#58a6ff] transition-colors">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex gap-4 text-sm text-[#8b949e]">
            {data.email && <span className="flex items-center gap-2">📧 {data.email}</span>}
            {data.location && <span className="flex items-center gap-2">📍 {data.location}</span>}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24 border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-[#3fb950] text-sm mb-2">// work history</div>
          <h2 className="text-3xl font-bold text-white mb-12">Experience</h2>
          <div className="space-y-12">
            {data.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-[#8b949e] text-sm md:text-right pt-1">
                  <div className="text-[#58a6ff] font-medium">{exp.company}</div>
                  <div>{exp.duration}</div>
                </div>
                <div className="md:col-span-3 bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#58a6ff]/50 transition-colors">
                  <h3 className="text-white font-semibold text-lg mb-3">{exp.role}</h3>
                  <ul className="space-y-2">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-[#8b949e] text-sm flex gap-3">
                        <span className="text-[#3fb950] mt-0.5 shrink-0">+</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <section id="projects" className="py-24 border-t border-[#21262d]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-[#3fb950] text-sm mb-2">// things i built</div>
            <h2 className="text-3xl font-bold text-white mb-12">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#58a6ff]/50 transition-all hover:-translate-y-1">
                  <div className="text-[#58a6ff] text-2xl mb-3">📁</div>
                  <h3 className="text-white font-semibold mb-2">{proj.name}</h3>
                  <p className="text-[#8b949e] text-sm mb-4 leading-relaxed">{proj.description}</p>
                  {proj.tech && (
                    <div className="flex flex-wrap gap-2">
                      {proj.tech.map((t, j) => (
                        <span key={j} className="text-xs text-[#58a6ff]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <section className="py-24 border-t border-[#21262d]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-[#3fb950] text-sm mb-2">// background</div>
            <h2 className="text-3xl font-bold text-white mb-12">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{edu.degree}</h3>
                    <p className="text-[#8b949e] text-sm">{edu.institution}</p>
                  </div>
                  <span className="text-[#58a6ff] text-sm">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-24 border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-[#3fb950] text-sm mb-2">// get in touch</div>
          <h2 className="text-3xl font-bold text-white mb-4">Contact</h2>
          <p className="text-[#8b949e] mb-8">Open to new opportunities and collaborations.</p>
          <a href={"mailto:" + data.email} className="inline-block px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold rounded-lg transition-colors">
            Say Hello
          </a>
          <div className="mt-12 text-[#8b949e] text-xs">
            Built with PortfolioAI
          </div>
        </div>
      </section>

    </div>
  )
}