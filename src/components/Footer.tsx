import { Heart, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight">
              Career Survival Kit AI
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your hyper-personalized application copilot, empowering candidates worldwide.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center space-x-6 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                Design &amp; Development by <strong className="text-slate-800 font-semibold">Devaharshini</strong>
              </span>
              <a
                href="mailto:devaharshinivootakoti@gmail.com"
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                title="Send Email"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>devaharshinivootakoti@gmail.com</span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                id="btn-digital-heroes"
                href="https://digitalheroesco.com"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-950 rounded-lg hover:bg-indigo-600 hover:border-indigo-700 active:transform active:scale-95 transition-all shadow-sm"
              >
                <span>Built for Digital Heroes</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Career Survival Kit AI. All rights reserved.</p>
          <div className="flex items-center gap-1.5 mt-2 md:mt-0">
            <span>Crafted with passion for non-filtered CV performance</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
