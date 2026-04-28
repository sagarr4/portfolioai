'use client'
import { ParsedResume } from '@/lib/ai/parseResume'

export default function MinimalTheme({ data }: { data: ParsedResume }) {
  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-100 z-50 px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg">{data.name}</span>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#experience" className="hover:text-gray-900 transition-colors">Experience</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-20">
        <div className="max-w-4xl mx-auto px-8 py-24 w-full">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">{data.name}</h1>
          <p className="text-2xl text-gray-400 mb-8">{data.title}</p>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed mb-10">{data.summary}</p>
          <div className="flex flex-wrap gap-3 mb-10">
            {data.skills.slice(0, 8).map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            {data.email && <span>{data.email}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-bold mb-12">Experience</h2>
          <div className="space-y-10">
            {data.experience.map((exp, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{exp.role}</h3>
                    <p className="text-blue-600">{exp.company}</p>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">{exp.duration}</span>
                </div>
                <ul className="space-y-2">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-gray-600 text-sm flex gap-2">
                      <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-3xl font-bold mb-12">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((proj, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <h3 className="font-semibold text-lg mb-2">{proj.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{proj.description}</p>
                  {proj.tech && (
                    <div className="flex flex-wrap gap-2">
                      {proj.tech.map((t, j) => (
                        <span key={j} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{t}</span>
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
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-3xl font-bold mb-12">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-gray-400 text-sm">{edu.institution}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4">Get in touch</h2>
          <p className="text-gray-400 mb-8">Open to new opportunities.</p>
          <a href={"mailto:" + data.email} className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors">
            {data.email}
          </a>
          <div className="mt-12 text-gray-300 text-xs">Built with PortfolioAI</div>
        </div>
      </section>
    </div>
  )
}