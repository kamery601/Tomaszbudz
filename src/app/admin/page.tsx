import { getLoggedInAdmin } from '@/lib/auth';
import { pricingConfig } from '@/lib/pricing';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminPricingEditor from '@/components/AdminPricingEditor';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export default async function AdminPage() {
  const admin = await getLoggedInAdmin();

  if (!admin) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-10">
      <div className="mx-auto max-w-7xl relative">
        <div className="absolute right-0 top-0 mt-4 mr-4">
          <AdminLogoutButton />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
          <AdminPricingEditor initialPricing={pricingConfig} adminName={admin} />
        </div>
      </div>
    </div>
  );
}
