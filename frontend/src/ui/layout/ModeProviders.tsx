import {
  WorkspaceProvider,
  ConversationsProvider,
} from "@/application/contexts";
import type { ReactNode } from "react";

// 👉 importa aquí SOLO los providers que quieras que tengan estado separado por modo

// (User/Auth suelen ser globales en el árbol raíz; si los montas aquí,
//  también se separarían por modo, pero normalmente no interesa)

type Props = {
  mode: "mini" | "desktop";
  children: ReactNode;
};

/**
 * Monto providers con una key dependiente del modo -> fuerza remount del subárbol
 * y garantiza estado independiente mini vs desktop.
 */
export default function ModeProviders({ mode, children }: Props) {
  return (
    <div key={`mode-boundary-${mode}`}>
      <WorkspaceProvider>
        <ConversationsProvider>{children}</ConversationsProvider>
      </WorkspaceProvider>
    </div>
  );
}
