import LegalPageLayout from './LegalPageLayout';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>Data Collection</h3>
      <p>PlayTime Rentals collects only essential information required for secure verification (such as Aadhaar/PAN validation) and delivery logistical routing across Vizag.</p>
      
      <h3>Location</h3>
      <p>If you pin your location while booking, we use it only to deliver and pick up your console. Pinning is optional, and your location is never shown to other customers.</p>
      
      <h3>Data Usage</h3>
      <p>Your data is explicitly used to verify bookings, coordinate delivery times, and safeguard our hardware. We do not sell your personal data to non-participating third-parties.</p>
      
    </LegalPageLayout>
  );
}
