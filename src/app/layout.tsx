import type { Metadata } from "next";
import { Poppins, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AskAI from "@/components/AskAI";
import { getPublicShellData } from "@/lib/cms/public-site";
import { SITE_NAME } from "@/lib/site-brand";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Empowering students and youth through skills, education, and guidance. Scholarship guidance, leadership training, and community-based development.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = await getPublicShellData();
  const settings = shell.settings;
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Navbar
          navigation={shell.headerNavigation}
          instituteName={settings?.institute_name}
          logoUrl={shell.logoUrl}
        />
        <main>{children}</main>
        <Footer
          navigation={shell.footerNavigation}
          description={settings?.footer_description}
          email={settings?.primary_email}
          phone={settings?.primary_phone}
          address={settings?.default_office_address}
          socialLinks={shell.socialLinks}
        />
        <AskAI />
      </body>
    </html>
  );
}
