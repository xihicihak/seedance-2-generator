import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | PornMake - Wan 2.2 Studio",
  description: "Privacy and data protection policy for PornMake Wan 2.2 Studio users.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            Data Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400">
            Last Updated: October 2026 • Your Privacy & Security First
          </p>
        </div>

        <div className="mt-8 space-y-8 text-xs leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect minimal information necessary to deliver high-quality AI video generation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Account Credentials:</strong> If you sign in via Google OAuth, we receive your email address and public name to manage your credits and account authentication.</li>
              <li><strong>Task Generation History:</strong> Text prompts, aspect ratio selections, and video outputs are stored securely and associated solely with your private user identifier.</li>
              <li><strong>Payment Transactions:</strong> We do NOT store your payment card numbers. All billing is processed directly by Stripe under PCI-DSS Level 1 compliance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Confidentiality & Non-Disclosure of Prompts</h2>
            <p>
              We treat your prompts and creative ideas with strict confidentiality. Your prompts and generated outputs are private to your account unless you explicitly choose to share or publish them publicly. We do not sell your personal data or creative generation histories to third-party data brokers or advertising networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Cookies & Session Storage</h2>
            <p>
              We use strictly necessary cookies to keep you signed in securely and localStorage to store your age verification confirmation so you are not prompted on every page load.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Data Deletion & User Rights</h2>
            <p>
              Under GDPR, CCPA, and global privacy standards, you have the right to request deletion of your account and all associated generation data at any time. You can clear your history or contact support to request permanent database deletion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">5. Contact Information</h2>
            <p>
              If you have any questions regarding this Privacy Policy or wish to exercise your data protection rights, please contact our privacy compliance team at support@pornmakes.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
