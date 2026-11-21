import "./globals.css";
import { Inter } from "next/font/google";
const inter=Inter({subsets:["latin"]});
export const metadata={title:"NETA | Construction Company",description:"NETA builds commercial and residential projects, from groundworks to handover."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={inter.className}>{children}</body></html>}