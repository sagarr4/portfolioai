'use client'
import { ParsedResume } from '@/lib/ai/parseResume'

export default function DesignTheme({ data }: { data: ParsedResume }) {
  const colors = ['bg-pink-500', 'bg-violet-500', 'bg-yellow-400', 'bg-cyan-400', 'bg-orange-500']
  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 z-50 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">{data.name}</span>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#work" className="hover:text-gray-900 transition-colors">Work</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen pt-24 flex items-center">
        <div className="max-w-6xl mx-auto px-8 py-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
                {data.title}
              </div>
              <h1 className="text-7xl font-black leading-none mb-8 tracking-tight">
                {data.name.split(' ').map((word, i) => (
                  <span key={i} className={"block " + (i % 2 === 1 ? "text-violet-600" : "")}>{word}</span>
                ))}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{data.summary}</p>
              <a href="#contact" className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-violet-600 transition-colors">
                Get in touch
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {data.skills.slice(0, 6).map((skill, i) => (
                <div key={i} className={"rounded-2xl p-6 text-white font-bold text-lg " + colors[i % colors.length]}>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-black mb-16 tracking-tight">Selected Work</h2>
          <div className="space-y-6">
            {data.experience.map((exp, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 flex items-start gap-8 hover:shadow-xl transition-shadow">
                <div className={"w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 " + colors[i % colors.length]}>
                  {exp.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{exp.role}</h3>
                      <p className="text-violet-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-gray-400 text-sm shrink-0">{exp.duration}</span>
                  </div>
                  <ul className="space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-gray-600 text-sm flex gap-2">
                        <span className="text-violet-400 shrink-0">→</span>
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
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-5xl font-black mb-16 tracking-tight">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((proj, i) => (
                <div key={i} className={"rounded-3xl p-8 text-white " + colors[i % colors.length]}>
                  <h3 className="text-2xl font-black mb-3">{proj.name}</h3>
                  <p className="opacity-90 mb-4">{proj.description}</p>
                  {proj.tech && (
                    <div className="flex flex-wrap gap-2">
                      {proj.tech.map((t, j) => (
                        <span key={j} className="px-3 py-1 bg-white/20 rounded-full text-sm">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT + EDUCATION */}
      <section id="about" className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-black mb-8 tracking-tight">About</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{data.summary}</p>
              {data.location && <p className="text-violet-400">📍 {data.location}</p>}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">Education</h3>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-4 pb-4 border-b border-gray-700">
                  <h4 className="font-bold text-white">{edu.degree}</h4>
                  <p className="text-gray-400 text-sm">{edu.institution} · {edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-violet-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-6xl font-black mb-6 tracking-tight">Let's work<br/>together</h2>
          <p className="text-violet-200 text-lg mb-10">Have a project in mind? I'd love to hear about it.</p>
          <a href={"mailto:" + data.email} className="inline-block px-10 py-5 bg-white text-violet-600 font-black text-lg rounded-full hover:scale-105 transition-transform">
            {data.email}
          </a>
          <div className="mt-12 text-violet-300 text-xs">Built with PortfolioAI</div>
        </div>
      </section>
    </div>
  )
}