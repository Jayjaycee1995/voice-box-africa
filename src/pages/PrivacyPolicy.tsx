import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="card-elevated p-6 md:p-10 rounded-2xl">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                  VoiceBox Africa ("VoiceBox", "we", "us") respects your privacy. This Privacy Policy explains
                  how we collect, use, disclose, and protect your information when you use our website and
                  services (the "Service").
                </p>

                <h2>Information We Collect</h2>
                <ul>
                  <li>
                    <strong>Account information</strong>: name, email address, password (stored securely by our
                    authentication provider), and profile details you provide.
                  </li>
                  <li>
                    <strong>Profile and marketplace data</strong>: bio, languages, specialties, pricing details,
                    portfolio/demos, project postings, proposals, messages, and invitations.
                  </li>
                  <li>
                    <strong>Usage data</strong>: pages viewed, interactions, device information, and diagnostic
                    data to help us improve the Service.
                  </li>
                </ul>

                <h2>How We Use Your Information</h2>
                <ul>
                  <li>Provide, maintain, and improve the Service.</li>
                  <li>Enable marketplace features such as projects, proposals, messaging, and bookings.</li>
                  <li>Send essential service communications (e.g., account, security, and transactional notices).</li>
                  <li>Protect against fraud, abuse, and unauthorized access.</li>
                </ul>

                <h2>How We Share Information</h2>
                <p>We may share information in the following circumstances:</p>
                <ul>
                  <li>
                    <strong>With other users</strong>: profile information you choose to publish is visible to
                    other users as part of the marketplace.
                  </li>
                  <li>
                    <strong>With service providers</strong>: trusted partners who help us operate the Service
                    (e.g., hosting, analytics, email, customer support).
                  </li>
                  <li>
                    <strong>For legal reasons</strong>: if required to comply with applicable law or a valid legal
                    process.
                  </li>
                </ul>

                <h2>Data Retention</h2>
                <p>
                  We retain your information for as long as necessary to provide the Service and for legitimate
                  business purposes, including compliance, dispute resolution, and enforcement of agreements.
                </p>

                <h2>Security</h2>
                <p>
                  We use reasonable administrative, technical, and physical safeguards designed to protect your
                  information. No method of transmission or storage is completely secure, so we cannot guarantee
                  absolute security.
                </p>

                <h2>Your Choices</h2>
                <ul>
                  <li>Update your profile details in your account settings.</li>
                  <li>Request access, correction, or deletion of your personal information where applicable.</li>
                </ul>

                <h2>Cookies and Similar Technologies</h2>
                <p>
                  We may use cookies and similar technologies to keep you signed in, remember preferences, and
                  understand how the Service is used.
                </p>

                <h2>Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our practices, contact us via the Contact page
                  or through the support channels provided within the Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
