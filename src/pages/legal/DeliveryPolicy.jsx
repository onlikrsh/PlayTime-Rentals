import LegalPageLayout from './LegalPageLayout';

export default function DeliveryPolicy() {
  return (
    <LegalPageLayout title="Delivery Areas & Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>Free Delivery Zones</h3>
      <p>PlayTime Rentals provides comprehensive and free PS5 console delivery across every major residential footprint within Visakhapatnam, including:</p>
      <ul>
         <li>MVP Colony</li>
         <li>Madhurawada & Yendada</li>
         <li>Seethammadhara</li>
         <li>PM Palem</li>
         <li>Gajuwaka</li>
         <li>Rushikonda & Dwaraka Nagar</li>
      </ul>
      
      <h3>Setup Protocol</h3>
      <p>Our logistical operators will personally install and test the console on your primary television or monitor to establish working fidelity prior to commencing the rental duration.</p>
      
    </LegalPageLayout>
  );
}
