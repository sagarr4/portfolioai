'use client'
import { ParsedResume } from '@/lib/ai/parseResume'

export default function CreativeTheme({ data }: { data: ParsedResume }) {
  return (
    <div className="bg-[#f5f0e8] text-gray-900 min-h-screen">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-[#f5f0e8]/95 backdrop-blur z-50 px-8 py-5 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl italic">{data.name}</span>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#work" className="hover:text-gray-900 transition-colors">Work</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO — magazine spread */}
      <section className="min-h-screen pt-24 flex flex-col justify-end pb-16">
        <div className="max-w-6xl mx-auto px-8 w-full">
          <div className="border-t-4 border-gray-900 pt-8">
            <div className="grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 md:col-span-8">
                <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">{data.title}</p>
                <h1 className="text-8xl font-black leading-none tracking-tighter mb-6">{data.name}</h1>
              </div>
              <div className="col-span-12 md:col-span-4">
                <p className="text-gray-600 leading-relaxed italic text-lg">{data.summary}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 pt-6 flex flex-wrap gap-6">
            {data.skills.slice(0, 6).map((skill, i) => (
              <span key={i} className="text-sm text-gray-500 uppercase tracking-wider">{skill}</span>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE — editorial layout */}
      <section id="work" className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-6xl font-black italic mb-16 tracking-tight">Work</h2>
          <div className="space-y-12">
            {data.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-gray-700">
                <div>
                  <span className="text-5xl font-black text-gray-700 block mb-4">0{i + 1}</span>
                  <h3 className="text-2xl font-black italic mb-2">{exp.role}</h3>
                  <p className="text-orange-400 font-medium">{exp.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{exp.duration}</p>
                </div>
                <div className="space-y-3 pt-2">
                  {exp.highlights.map((h, j) => (
                    <p key={j} className="text-gray-300 text-sm leading-relaxed border-l-2 border-orange-400 pl-4">{h}</p>
                  ))}
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
            <h2 className="text-6xl font-black italic mb-16 tracking-tight">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.projects.map((proj, i) => (
                <div key={i} className="border border-gray-300 p-8 hover:bg-white transition-colors">
                  <div className="text-4xl font-black text-gray-200 mb-4">0{i + 1}</div>
                  <h3 className="text-xl font-black italic mb-3">{proj.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{proj.description}</p>
                  {proj.tech && (
                    <div className="flex flex-wrap gap-2">
                      {proj.tech.map((t, j) => (
                        <span key={j} className="text-xs text-orange-600 uppercase tracking-wide">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" className="py-24 bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-6xl font-black italic mb-8">About</h2>
              <p className="text-orange-100 text-lg leading-relaxed">{data.summary}</p>
              {data.location && <p className="mt-6 text-orange-200">Based in {data.location}</p>}
            </div>
            <div>
              <h3 className="text-2xl font-black italic mb-6">Education</h3>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-6 pb-6 border-b border-orange-400">
                  <h4 className="font-bold text-xl">{edu.degree}</h4>
                  <p className="text-orange-200">{edu.institution} · {edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-32 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-8xl font-black italic tracking-tighter mb-8">Hello.</h2>
          <p className="text-gray-500 text-lg mb-10">Let's create something together.</p>
          <a href={"mailto:" + data.email} className="inline-block px-10 py-5 bg-gray-900 text-white font-black text-lg hover:bg-orange-500 transition-colors">
            {data.email}
          </a>
          <div className="mt-12 text-gray-400 text-xs">Built with PortfolioAI</div>
        </div>
      </section>
    </div>
  )
}