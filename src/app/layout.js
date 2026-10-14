import "./globals.css";

export const metadata = {
  title: "PornMake - Next-Gen AI Video Generator",
  description: "Create hyper-realistic, cinematic AI videos from text and photos powered by the Wan 2.2 engine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
