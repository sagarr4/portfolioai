'use client'
import { ParsedResume } from '@/lib/ai/parseResume'

export default function FinanceTheme({ data }: { data: ParsedResume }) {
  return (
    <div className="bg-[#fafaf8] text-gray-900 min-h-screen" style={{fontFamily: 'Georgia, serif'}}>

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-[#fafaf8]/95 backdrop-blur border-b border-gray-200 z-50 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl tracking-wide">{data.name}</span>
          <div className="flex gap-8 text-sm text-gray-500 font-sans">
            <a href="#experience" className="hover:text-gray-900 transition-colors">Experience</a>
            <a href="#education" className="hover:text-gray-900 transition-colors">Education</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen pt-24 flex items-center border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-24 w-full">
          <div className="max-w-3xl">
            <p className="text-gray-500 text-sm font-sans uppercase tracking-widest mb-6">{data.field} Professional</p>
            <h1 className="text-6xl font-bold leading-tight mb-6">{data.name}</h1>
            <div className="w-16 h-1 bg-gray-900 mb-8"></div>
            <p className="text-2xl text-gray-600 italic mb-8">{data.title}</p>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-10">{data.summary}</p>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-sans">
              {data.email && <span>{data.email}</span>}
              {data.location && <span>{data.location}</span>}
              {data.phone && <span>{data.phone}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex flex-wrap gap-8 justify-center">
            {data.skills.slice(0, 8).map((skill, i) => (
              <div key={i} className="text-center">
                <div className="w-1 h-8 bg-yellow-400 mx-auto mb-3"></div>
                <span className="text-sm font-sans text-gray-300 uppercase tracking-wider">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-gray-400 text-sm font-sans uppercase tracking-widest mb-2">Career History</p>
          <h2 className="text-4xl font-bold mb-16">Professional Experience</h2>
          <div className="space-y-16">
            {data.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-gray-100">
                <div>
                  <h3 className="text-yellow-600 font-bold text-lg mb-1">{exp.company}</h3>
                  <p className="text-gray-500 text-sm font-sans">{exp.duration}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-xl font-bold mb-4">{exp.role}</h4>
                  <ul className="space-y-3">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-gray-600 flex gap-3 text-sm font-sans leading-relaxed">
                        <span className="text-yellow-500 mt-1 shrink-0">—</span>
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

      {/* EDUCATION */}
      <section id="education" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-gray-400 text-sm font-sans uppercase tracking-widest mb-2">Academic Background</p>
          <h2 className="text-4xl font-bold mb-12">Education</h2>
          <div className="space-y-6">
            {data.education.map((edu, i) => (
              <div key={i} className="flex items-center justify-between py-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold">{edu.degree}</h3>
                  <p className="text-gray-500 font-sans">{edu.institution}</p>
                </div>
                <span className="text-gray-400 font-sans text-sm">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-8">
          <p className="text-gray-400 text-sm font-sans uppercase tracking-widest mb-4">Get in Touch</p>
          <h2 className="text-4xl font-bold mb-6">Open to Opportunities</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mb-8"></div>
          <p className="text-gray-400 font-sans mb-10">Available for senior roles and advisory positions.</p>
          <a href={"mailto:" + data.email} className="inline-block px-10 py-4 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-sans font-semibold transition-colors tracking-wider uppercase text-sm">
            Send a Message
          </a>
          <div className="mt-12 text-gray-600 text-xs font-sans">Built with PortfolioAI</div>
        </div>
      </section>
    </div>
  )
}