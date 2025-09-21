import type { ReactNode } from "react";

const Main = ({ children }: { children: ReactNode }) => {
  return <main className="container pt-4">{children}</main>;
};

export default Main;
