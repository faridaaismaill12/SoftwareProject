import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "../../context/SocketProvider"; // Update this to your correct path
import Navbar from "./_components/navbar/Navbar";
import Footer from "./_components/footer/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* You can place meta tags, links, etc. here */}
      </head>
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        {/* Provide Socket Context Globally */}
        <SocketProvider>
          {/* Navbar */}
          <Navbar />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* Render Page Content */}
          {children}

          {/* Footer */}
          <Footer />
        </SocketProvider>
      </body>
    </html>
  );
}
