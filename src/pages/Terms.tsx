import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Terms &amp; Conditions</h1>
              <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="card-elevated p-6 md:p-10 rounded-2xl">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                  These Terms &amp; Conditions ("Terms") govern your access to and use of VoiceBox Africa ("VoiceBox",
                  "we", "us") and the services, features, and content we provide (the "Service"). By using the Service,
                  you agree to these Terms.
                </p>

                <h2>Eligibility and Accounts</h2>
                <ul>
                  <li>You must provide accurate information and keep your account details up to date.</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
                </ul>

                <h2>Marketplace Rules</h2>
                <ul>
                  <li>
                    <strong>Clients</strong> may post projects and communicate with talent.
                  </li>
                  <li>
                    <strong>Talent</strong> may submit proposals, manage their profile, and deliver work as agreed with
                    clients.
                  </li>
                  <li>
                    You agree to provide truthful information and to not misrepresent identity, skills, rates, or work.
                  </li>
                </ul>

                <h2>Content and Licensing</h2>
                <p>
                  You retain ownership of content you upload or submit to the Service. You grant VoiceBox a limited
                  license to host, store, reproduce, and display your content solely to operate and improve the Service.
                </p>

                <h2>Prohibited Conduct</h2>
                <ul>
                  <li>Uploading unlawful, harmful, or infringing content.</li>
                  <li>Attempting to access accounts, data, or systems you are not authorized to access.</li>
                  <li>Interfering with the Service, including scraping or automated abuse.</li>
                  <li>Harassment, spam, or any behavior that undermines the marketplace.</li>
                </ul>

                <h2>Third-Party Services</h2>
                <p>
                  The Service may integrate third-party services. Your use of those services is governed by their terms
                  and privacy policies.
                </p>

                <h2>Disclaimers</h2>
                <p>
                  The Service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted
                  access, and we disclaim warranties to the maximum extent permitted by law.
                </p>

                <h2>Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, VoiceBox will not be liable for indirect, incidental,
                  consequential, or punitive damages, or any loss of profits or data arising from your use of the
                  Service.
                </p>

                <h2>Termination</h2>
                <p>
                  You may stop using the Service at any time. We may suspend or terminate your access if we reasonably
                  believe you have violated these Terms.
                </p>

                <h2>Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. Continued use of the Service after changes become
                  effective constitutes acceptance of the updated Terms.
                </p>

                <h2>Contact</h2>
                <p>
                  If you have questions about these Terms, contact us via the Contact page or through the support
                  channels provided within the Service.
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

export default Terms;
