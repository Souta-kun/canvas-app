import { useState } from "react";
import { KanbanProvider } from "@/kanban/context";
import { BoardSidebar } from "@/kanban/components/BoardSidebar";
import { BoardView } from "@/kanban/components/BoardView";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <KanbanProvider>
      <div className="flex h-screen overflow-hidden">
        <BoardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <BoardView />
      </div>
    </KanbanProvider>
  );
};

export default Index;
