import { Link } from 'react-router-dom';
import { Button } from '../shared/Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDocsUrl = () => {
        if (typeof window === 'undefined') return 'https://openclaw.minions.help';
        return window.location.hostname.startsWith('dev--') ? 'https://openclaw.minions.help' : 'https://openclaw.minions.help';
    };

    const getBlogUrl = () => {
        if (typeof window === 'undefined') return 'https://openclaw.minions.blog';
        return window.location.hostname.startsWith('dev--') ? 'https://openclaw.minions.blog' : 'https://openclaw.minions.blog';
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="font-mono text-xl font-bold text-primary">🔗 openclaw</span>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                    <a href={getDocsUrl()} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted transition-colors hover:text-primary">Docs</a>
                    <a href={getBlogUrl()} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted transition-colors hover:text-primary">Blog</a>
                    <Link to="/dashboard" className="text-sm font-medium text-muted transition-colors hover:text-primary">Dashboard</Link>
                    <a href="https://github.com/mxn2020/minions-openclaw" target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-sm font-medium text-muted transition-colors hover:text-primary">
                        <span>GitHub</span>
                        <span className="ml-1 inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold">★ Star</span>
                    </a>
                    <Link to="/dashboard">
                        <Button size="sm">Open Dashboard</Button>
                    </Link>
                </div>

                <button className="md:hidden text-muted hover:text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-b border-border bg-surface"
                    >
                        <div className="flex flex-col space-y-4 p-4">
                            <a href={getDocsUrl()} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted hover:text-primary">Docs</a>
                            <a href={getBlogUrl()} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted hover:text-primary">Blog</a>
                            <Link to="/dashboard" className="text-sm font-medium text-muted hover:text-primary">Dashboard</Link>
                            <a href="https://github.com/mxn2020/minions-openclaw" className="text-sm font-medium text-muted hover:text-primary">GitHub</a>
                            <Link to="/dashboard">
                                <Button className="w-full">Open Dashboard</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
