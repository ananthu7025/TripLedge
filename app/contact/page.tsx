import React from "react";
import { ContactForm } from "@/components/ContactForm/ContactForm";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
