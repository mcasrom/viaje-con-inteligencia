import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
