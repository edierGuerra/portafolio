
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/portfolio-ui-refresh.css";

const pathname = window.location.pathname.toLowerCase();
const root = createRoot(document.getElementById("root")!);

async function bootstrap() {
	if (pathname.startsWith("/cms")) {
		const { default: CmsApp } = await import("./cms/CmsApp.tsx");
		root.render(<CmsApp />);
		return;
	}

	const { default: App } = await import("./App.tsx");
	root.render(<App />);
}

void bootstrap();
  