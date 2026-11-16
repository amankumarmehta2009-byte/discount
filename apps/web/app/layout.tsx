import "./globals.css";

export const metadata = {
  title: "DISCOUNT — One Search. Every Store. Best Deal.",
  description: "Compare shopping prices, coupons and bank offers in one place."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
