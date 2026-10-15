import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | PornMake - Wan 2.2 Studio",
  description: "Terms and conditions governing the use of PornMake Wan 2.2 Studio services.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>

        <div className="mt-8 space-y-8 text-xs leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Age Requirement & Legal Capacity</h2>
            <p>
              By accessing or using PornMake (&quot;the Service&quot;), you explicitly warrant and represent that you are at least 18 years of age (or the age of legal majority in your country, state, or jurisdiction). If you are under 18 years of age, you are strictly prohibited from entering, viewing, or interacting with the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Acceptable Use & Content Restrictions</h2>
            <p>
              PornMake provides generative AI video tools powered by Wan 2.2 technology. We strictly prohibit the generation, transmission, or storage of:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Any form of Child Sexual Abuse Material (CSAM) or any visual depiction involving minors (zero tolerance, immediate account termination and reporting to relevant authorities).</li>
              <li>Non-consensual sexual imagery (NCII), deepfakes of real living individuals without explicit written consent.</li>
              <li>Extreme violence, non-consensual sexual content, terrorism, hate speech, or harassment.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. GPU Compute Credits & Billing</h2>
            <p>
              All purchases on PornMake are for consumable GPU compute credits used to execute Wan 2.2 rendering jobs. Credit packs are one-time purchases and do not expire. Due to the high cost of GPU infrastructure consumed during video generation, credits used for successfully initiated or completed rendering tasks are non-refundable. If you experience technical errors caused by platform outages, please contact support for credit restoration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Intellectual Property & Commercial License</h2>
            <p>
              As between you and PornMake, you retain all ownership rights to the prompt inputs and reference images you submit. PornMake grants you a worldwide, royalty-free, perpetual license to use, reproduce, modify, and distribute the video outputs generated through your validly purchased credits for personal and commercial purposes, subject to compliance with these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">5. 18 U.S.C. § 2257 Compliance Notice</h2>
            <p>
              All video creations and visual materials generated on this platform are synthetic digital assets produced entirely by artificial intelligence models (Wan 2.2). No actual human performers were filmed or photographed in the production of synthetic content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">6. Limitation of Liability</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. PornMake shall not be liable for any indirect, incidental, or consequential damages resulting from your use of generated outputs.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
