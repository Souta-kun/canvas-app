import { BoardSidebar } from "@/kanban/components/BoardSidebar";
import { BoardView } from "@/kanban/components/BoardView";
import { KeyGate } from "@/kanban/components/KeyGate";
import { KanbanProvider } from "@/kanban/context";
import { useState } from "react";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <KanbanProvider>
      <KeyGate>
        <div className="flex h-screen overflow-hidden">
          <BoardSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
          <BoardView />
        </div>
      </KeyGate>
    </KanbanProvider>
  );
};

export default Index;
