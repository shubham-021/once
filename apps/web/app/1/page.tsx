import { CodexSidebarClassic } from "../../components/design-showcase/design-1/codex";
import { ProtagonistSidebarClassic } from "../../components/design-showcase/design-1/protagonist";
import { DesignLayout } from "../../components/design-showcase/design-layout";

export default function DesignOne() {
  return (
    <DesignLayout
      title="Design 1: Classic Enhanced"
      codexSidebar={<CodexSidebarClassic />}
      protagonistSidebar={<ProtagonistSidebarClassic />}
    />
  );
}
