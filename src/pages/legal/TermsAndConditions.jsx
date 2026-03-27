import LegalPageLayout from './LegalPageLayout';

export default function TermsAndConditions() {
  return (
    <LegalPageLayout title="Terms & Conditions">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and utilizing PlayTime Rentals for PS5 gaming console services within Vizag, you agree to comply with and be bound by these functional terms.</p>
      
      <h3>2. Liability & Damage</h3>
      <p>The renter assumes full liability for the hardware condition during the agreed rental period. Any physical tampering or damages to the PlayStation 5 console or controllers will incur immediate replacement or repair charges.</p>
      
      <h3>3. Governing Law</h3>
      <p>These terms and conditions are governed by operations primarily within the jurisdiction of Visakhapatnam, Andhra Pradesh.</p>
    </LegalPageLayout>
  );
}
