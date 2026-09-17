import { URLS } from '../lib/dg-tool-kit'

export default function Footer() {
  return (
    <footer className="dg-footer w-full px-6 py-10 text-center" data-testid="site-footer">
      <div className="mx-auto max-w-3xl space-y-2 text-sm text-slate">
        <p>
          Doctor Gemma's content is for informational purposes only. For medical advice please
          book an appointment with your family doctor.
        </p>
        <p>Copyright 2025-2035 DoctorGemma.com. All rights reserved.</p>
        <p>
          <a
            href={URLS.gallery}
            className="font-semibold text-forest underline underline-offset-2 hover:text-sage"
            data-testid="footer-all-tools-link"
          >
            All AI tools
          </a>
        </p>
      </div>
    </footer>
  )
}
