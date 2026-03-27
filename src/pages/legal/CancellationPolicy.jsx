import LegalPageLayout from './LegalPageLayout';

export default function CancellationPolicy() {
  return (
    <LegalPageLayout title="Cancellation Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>Free Cancellation Window</h3>
      <p>PlayTime Rentals provides free cancellation of any PlayStation 5 booking up to 24 hours prior to the scheduled delivery slot.</p>
      
      <h3>Late Cancellation & Refunds</h3>
      <p>Same-day cancellations after dispatch may incur a delivery penalty. Once the console is successfully delivered and configured at your location, no immediate refunds are provided for early termination of the rental agreement.</p>
      
    </LegalPageLayout>
  );
}
