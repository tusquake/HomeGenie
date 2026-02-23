import React, { useState } from 'react';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using HomeGenie's platform, website, mobile application, or any associated services (collectively, the "Service"), you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, you must immediately cease use of the Service.

These Terms constitute a legally binding agreement between you and HomeGenie, Inc. ("HomeGenie," "we," "us," or "our"), a company incorporated under the laws of Delaware, USA. Your continued use of the Service following any modifications to these Terms constitutes your acceptance of the revised Terms.

If you are accessing the Service on behalf of a business or other legal entity, you represent that you have the authority to bind that entity to these Terms. In such cases, "you" and "your" will refer to that entity.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Account Registration',
    content: `You must be at least 18 years of age to use the Service. By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is accurate, current, and complete.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify HomeGenie of any unauthorized use of your account or any other breach of security at security@homegenie.com.

HomeGenie reserves the right to refuse registration, suspend, or terminate accounts at its sole discretion, particularly in cases of suspected fraud, abuse, or violation of these Terms. You may not create multiple accounts or use another person's account without express authorization.`,
  },
  {
    id: 'acceptable-use',
    title: '3. Acceptable Use Policy',
    content: `You agree to use the Service solely for lawful purposes and in a manner consistent with all applicable local, state, national, and international laws and regulations. Prohibited activities include, but are not limited to:

(a) Submitting false, misleading, or fraudulent property listings or information; (b) Impersonating any person or entity, or misrepresenting your affiliation with any person or entity; (c) Collecting or harvesting personally identifiable information from the Service without consent; (d) Transmitting any unsolicited or unauthorized advertising or promotional material; (e) Interfering with or disrupting the integrity or performance of the Service or its servers; (f) Attempting to gain unauthorized access to any portion of the Service or any related systems; (g) Using automated scripts, bots, or scrapers to access the Service without prior written consent; (h) Engaging in any activity that could damage, disable, overburden, or impair HomeGenie's infrastructure.

Violation of this policy may result in immediate termination of your account and may expose you to civil and criminal liability.`,
  },
  {
    id: 'listings',
    title: '4. Property Listings & Content',
    content: `Users who submit property listings ("Listings") represent and warrant that they have the legal right to list the property and that all information provided is accurate, complete, and not misleading. HomeGenie does not independently verify the accuracy of Listings and makes no representations regarding their completeness or accuracy.

By submitting a Listing or any other content ("User Content"), you grant HomeGenie a non-exclusive, royalty-free, worldwide, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Service and HomeGenie's business operations.

HomeGenie reserves the right to remove any Listing or User Content that it determines, in its sole discretion, violates these Terms or is otherwise objectionable. You remain solely responsible for your Listings and any consequences arising from their publication.`,
  },
  {
    id: 'privacy',
    title: '5. Privacy & Data Protection',
    content: `Your use of the Service is also governed by HomeGenie's Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection, use, and sharing of your information as described in the Privacy Policy.

HomeGenie implements industry-standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is completely secure, and HomeGenie cannot guarantee absolute security of your data.

In compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you may have rights to access, correct, delete, or port your personal data. To exercise these rights, contact us at privacy@homegenie.com.`,
  },
  {
    id: 'payments',
    title: '6. Payments & Fees',
    content: `Certain features of the Service require payment of fees. All fees are stated in US Dollars unless otherwise specified. By providing a payment method, you authorize HomeGenie to charge all applicable fees to that payment method.

HomeGenie uses third-party payment processors and does not store complete payment card information. All transactions are subject to the terms and conditions of the applicable payment processor.

Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time, but no refunds will be issued for partial billing periods unless required by applicable law. HomeGenie reserves the right to change its fees with thirty (30) days prior notice.`,
  },
  {
    id: 'ip',
    title: '7. Intellectual Property',
    content: `The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of HomeGenie and its licensors. The Service is protected by copyright, trademark, trade secret, and other intellectual property laws.

HomeGenie's trademarks and trade dress may not be used in connection with any product or service without the prior written consent of HomeGenie. You agree not to remove, alter, or obscure any copyright, trademark, service mark, or other proprietary rights notices incorporated in or accompanying the Service.

Any feedback, suggestions, or ideas you provide regarding the Service may be used by HomeGenie without any obligation to you. By providing such feedback, you assign to HomeGenie all rights, title, and interest in and to such feedback.`,
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers & Limitations of Liability',
    content: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

HOMEGENIE DOES NOT WARRANT THAT (a) THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, (b) THE RESULTS OBTAINED FROM USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE, OR (c) ANY ERRORS IN THE SERVICE WILL BE CORRECTED.

TO THE FULLEST EXTENT PERMITTED BY LAW, HOMEGENIE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES. IN NO EVENT SHALL HOMEGENIE'S TOTAL LIABILITY EXCEED THE GREATER OF $100 USD OR THE AMOUNT YOU PAID HOMEGENIE IN THE TWELVE MONTHS PRECEDING THE CLAIM.`,
  },
  {
    id: 'indemnification',
    title: '9. Indemnification',
    content: `You agree to defend, indemnify, and hold harmless HomeGenie, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.

This indemnification obligation shall survive the termination of your account or these Terms.`,
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: `HomeGenie may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.

You may terminate your account at any time by contacting us at support@homegenie.com. Termination of your account does not relieve you of any obligations incurred prior to termination.

Sections of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, warranty disclaimers, limitations of liability, and dispute resolution provisions.`,
  },
  {
    id: 'disputes',
    title: '11. Dispute Resolution & Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.

Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, with arbitration taking place in Wilmington, Delaware. Each party shall bear its own costs and attorney's fees unless otherwise determined by the arbitrator.

YOU AND HOMEGENIE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.

Notwithstanding the foregoing, either party may seek injunctive relief in any court of competent jurisdiction for violations of intellectual property rights.`,
  }
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap');
        
        .terms-container { font-family: 'Source Serif 4', Georgia, serif; }
        .terms-title { font-family: 'Playfair Display', Georgia, serif; }
        
        .section-card {
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }
        .section-card:hover {
          border-left-color: #0ea5e9;
        }
        .section-card.active {
          border-left-color: #0ea5e9;
        }
        
        .toc-link {
          transition: all 0.15s ease;
          position: relative;
          padding-left: 0;
        }
        .toc-link::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #0ea5e9;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
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
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Effective Date: <span className="text-slate-700 dark:text-slate-300">February 23, 2026</span>
          </p>
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
            <strong>Important:</strong> Please read these Terms carefully before using the HomeGenie platform. These Terms govern your access to and use of all HomeGenie services.
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                Table of Contents
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
                className={`section-card p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-default ${activeSection === section.id ? 'active' : ''}`}
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

            {/* Footer note */}
            {/* <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-sm text-slate-400 dark:text-slate-500">
              These Terms of Service are provided as a template. Please have them reviewed by a qualified legal professional before publishing.
            </div> */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Terms;