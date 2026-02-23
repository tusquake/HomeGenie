import React, { useState } from 'react';

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `HomeGenie, Inc. ("HomeGenie," "we," "us," or "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you use our platform, website, or mobile application (collectively, the "Service").

By using the Service, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of the Service.`,
  },
  {
    id: 'what-we-collect',
    title: '2. Information We Collect',
    content: `We collect information you provide directly, such as your name, email address, phone number, billing information, and property details when you register or submit a listing. We also collect information automatically when you use the Service, including your IP address, browser type, device identifiers, pages visited, and time spent on the Service.

We may receive additional information about you from third-party services such as Google or Facebook if you choose to connect those accounts, as well as from property data providers and public records where permitted by law.`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: `We use your information to operate and improve the Service, process transactions, send you updates and marketing communications (where permitted), respond to your inquiries, detect and prevent fraud, and comply with legal obligations.

We may also use aggregated, anonymized data for analytics, research, and to improve our algorithms and recommendations. This data cannot reasonably be used to identify you.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking Technologies',
    content: `We use cookies, web beacons, and similar tracking technologies to enhance your experience, remember your preferences, analyze usage patterns, and deliver relevant advertising. Cookies may be session-based (deleted when you close your browser) or persistent (stored for a set period).

You can control cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the Service. We also use third-party analytics tools including Google Analytics; you can opt out via Google's opt-out tools.`,
  },
  {
    id: 'sharing',
    title: '5. How We Share Your Information',
    content: `We do not sell your personal information. We may share your data with trusted service providers who assist in operating the Service (e.g., payment processors, cloud hosting, email delivery), strictly for that purpose and under confidentiality obligations.

We may disclose your information if required by law, court order, or governmental authority, or to protect the rights, property, or safety of HomeGenie, our users, or the public. In the event of a merger or acquisition, your data may be transferred to the acquiring entity.`,
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting privacy@homegenie.com. We may retain certain information as required by law or for legitimate business purposes such as fraud prevention and dispute resolution.

Anonymized and aggregated data derived from your usage may be retained indefinitely.`,
  },
  {
    id: 'rights',
    title: '7. Your Rights',
    content: `Depending on your location, you may have the right to access, correct, delete, or export your personal data, and to object to or restrict certain processing. California residents have additional rights under the CCPA, including the right to know what data is collected and to opt out of data sales (we do not sell data). EEA and UK residents have rights under the GDPR.

To exercise any of these rights, contact us at privacy@homegenie.com. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.`,
  },
  {
    id: 'security',
    title: '8. Security',
    content: `We implement industry-standard measures including encryption in transit (TLS), encryption at rest, access controls, and regular security audits to protect your data. However, no system is completely secure and we cannot guarantee absolute security.

If you suspect unauthorized access to your account, contact security@homegenie.com immediately.`,
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    content: `The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a child without parental consent, we will delete it promptly. Contact us at privacy@homegenie.com if you believe we have inadvertently collected such information.`,
  }
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap');
        .terms-container { font-family: 'Source Serif 4', Georgia, serif; }
        .terms-title { font-family: 'Playfair Display', Georgia, serif; }
        .section-card { transition: all 0.2s ease; border-left: 3px solid transparent; }
        .section-card:hover { border-left-color: #0ea5e9; }
        .section-card.active { border-left-color: #0ea5e9; }
        .toc-link { transition: all 0.15s ease; position: relative; padding-left: 0; }
        .toc-link::before { content: ''; position: absolute; left: -12px; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; background: #0ea5e9; opacity: 0; transition: opacity 0.15s ease; }
        .toc-link:hover::before, .toc-link.active::before { opacity: 1; }
        .toc-link:hover, .toc-link.active { color: #0ea5e9; padding-left: 8px; }
        .content-body p { margin-bottom: 1rem; line-height: 1.8; }
      `}</style>

      <div className="max-w-6xl mx-auto terms-container">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-sm font-medium mb-5 tracking-wide uppercase">
            Legal Document
          </div>
          <h1 className="terms-title text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Effective Date: <span className="text-slate-700 dark:text-slate-300">February 23, 2026</span>
          </p>
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 text-sky-800 dark:text-sky-300 text-sm">
            <strong>Your privacy matters.</strong> We've written this policy in plain language so you understand exactly how your data is handled.
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`toc-link block text-sm text-slate-600 dark:text-slate-400 py-1 ${activeSection === s.id ? 'active' : ''}`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`section-card p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm ${activeSection === section.id ? 'active' : ''}`}
              >
                <h2 className="terms-title text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <div className="content-body text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  {section.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-sm text-slate-400 dark:text-slate-500">
              This Privacy Policy is provided as a template. Please have it reviewed by a qualified legal professional before publishing.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Privacy;