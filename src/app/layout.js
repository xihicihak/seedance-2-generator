import "./globals.css";
import { Providers } from "./providers";
import AgeGateModal from "@/components/AgeGateModal";

export const metadata = {
  title: "PornMake - Wan 2.2 Studio | Next-Gen AI Video Generator",
  description: "Create hyper-realistic, cinematic AI videos from text and photos powered by the Wan 2.2 engine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-rose-500 selection:text-white">
        <Providers>
          <AgeGateModal />
          {children}
        </Providers>
      </body>
    </html>
  );
}
