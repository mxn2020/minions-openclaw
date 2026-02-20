export default function Footer() {
    return (
        <footer className="border-t border-border bg-background py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-mono text-xl font-bold text-primary">🔗 openclaw manager</span>
                        </div>
                        <p className="mt-4 text-sm text-muted max-w-xs">
                            Manage, monitor, and version-control OpenClaw Gateway instances using the minions structured object system.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Project</h3>
                        <ul className="space-y-2 text-sm text-muted">
                            <li><a href="https://github.com/mxn2020/minions-openclaw" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="https://github.com/mxn2020/minions-openclaw" className="hover:text-primary transition-colors">GitHub</a></li>
                            <li><a href="https://www.npmjs.com/package/@minions-openclaw/cli" className="hover:text-primary transition-colors">NPM</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted">
                            <li><a href="https://github.com/mxn2020/minions-openclaw/blob/main/LICENSE" className="hover:text-primary transition-colors">License (MIT)</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center bg-background gap-2">
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} Minions Contributors. All rights reserved.
                    </p>
                    <p className="text-xs text-muted">
                        Created by <a href="https://the-mehdi.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Mehdi Nabhani</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
