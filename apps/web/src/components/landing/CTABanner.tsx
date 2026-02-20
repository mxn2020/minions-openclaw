import { Link } from 'react-router-dom';
import { Button } from '../shared/Button';

export default function CTABanner() {
    return (
        <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">
                    Start managing your gateways today
                </h2>
                <p className="text-muted max-w-lg mx-auto mb-8">
                    Open the dashboard to register instances, capture snapshots, and compare configs — all in the browser.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard">
                        <Button size="lg">Open Dashboard</Button>
                    </Link>
                    <a href="https://github.com/mxn2020/minions-openclaw" target="_blank" rel="noreferrer">
                        <Button size="lg" variant="secondary">View Source</Button>
                    </a>
                </div>
            </div>
        </section>
    );
}
