import { getLoggedInAdmin } from '@/lib/auth';
import { pricingConfig, type PricingConfig } from '@/lib/pricing';
import { getPricingItems } from '@/lib/pricing-store';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminPricingEditor from '@/components/AdminPricingEditor';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export default async function AdminPage() {
  const admin = await getLoggedInAdmin();

  if (!admin) {
    return <AdminLoginForm />;
  }

  const dbItems = await getPricingItems();
  const dbPriceByKey = new Map(dbItems.map((item) => [item.keyName, Number(item.priceNet)]));

  const pricingFromDb: PricingConfig = {
    ...pricingConfig,
    cables: Object.fromEntries(
      Object.entries(pricingConfig.cables).map(([key, cable]) => [
        key,
        { ...cable, price_net: dbPriceByKey.get(key) ?? cable.price_net }
      ])
    ),
    items: Object.fromEntries(
      Object.entries(pricingConfig.items).map(([key, item]) => [
        key,
        { ...item, price: dbPriceByKey.get(key) ?? item.price }
      ])
    )
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-10">
      <div className="mx-auto max-w-7xl relative">
        <div className="absolute right-0 top-0 mt-4 mr-4">
          <AdminLogoutButton />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
          <AdminPricingEditor initialPricing={pricingFromDb} adminName={admin} />
        </div>
      </div>
    </div>
  );
}
